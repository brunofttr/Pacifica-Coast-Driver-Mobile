package com.pacifica.coast;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Pacifica Coast Driver Mobile — oyunu (assets/pacifica-coast.html) tam ekran WebView içinde çalıştırır.
 *  İnternet yalnızca GitHub'daki sürüm dosyasını okumak (güncelleme bildirimi) için kullanılır. */
public class MainActivity extends Activity {
    private WebView web;

    /** JavaScript tarafı: window.AndroidApp.openUrl(url) — güncelleme sayfasını tarayıcıda açar. */
    public class Bridge {
        @JavascriptInterface public void openUrl(String url) {
            if (url == null || !url.startsWith("https://")) return;
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { /* tarayıcı yok */ }
        }
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.addJavascriptInterface(new Bridge(), "AndroidApp");
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);
        if (b == null) web.loadUrl("file:///android_asset/pacifica-coast.html");
        else web.restoreState(b);
    }

    private void immersive() {
        WindowInsetsController c = getWindow().getInsetsController();
        if (c != null) {
            c.hide(WindowInsets.Type.systemBars());
            c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }
    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); immersive(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
    @Override public void onBackPressed() { /* oyuna Esc gönder: duraklat; ana menüde arka plana al */ web.evaluateJavascript("(function(){var P=window.PC;if(P&&P.Menu){if(P.Menu.open){P.Menu.closePanel();return 1}if(P.Menu.ctx!=='main'){P.Menu.toggle();return 1}}return 0})()", v -> { if (!"1".equals(v)) moveTaskToBack(true); }); }
}

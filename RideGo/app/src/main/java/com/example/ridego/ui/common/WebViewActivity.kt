package com.example.ridego.ui.common

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.example.ridego.databinding.ActivityWebviewBinding

class WebViewActivity : AppCompatActivity() {

    private lateinit var binding: ActivityWebviewBinding
    private var currentUrl: String = ""

    companion object {
        const val EXTRA_URL = "extra_url"
        const val EXTRA_TITLE = "extra_title"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWebviewBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Lấy URL và title từ intent
        currentUrl = intent.getStringExtra(EXTRA_URL) ?: ""
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "RideGo"

        // Set title
        binding.tvTitle.text = title

        // Setup WebView
        setupWebView()

        // Setup click listeners
        binding.btnBack.setOnClickListener {
            if (binding.webView.canGoBack()) {
                binding.webView.goBack()
            } else {
                finish()
            }
        }

        binding.btnRefresh.setOnClickListener {
            binding.webView.reload()
        }

        binding.btnRetry.setOnClickListener {
            loadUrl()
        }

        // Load URL
        if (currentUrl.isNotEmpty()) {
            loadUrl()
        } else {
            showError("URL không hợp lệ")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                loadWithOverviewMode = true
                useWideViewPort = true
                builtInZoomControls = true
                displayZoomControls = false
                setSupportZoom(true)
                allowFileAccess = true
                allowContentAccess = true
                // Cho phép truy cập file assets
                mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                allowUniversalAccessFromFileURLs = true
                allowFileAccessFromFileURLs = true
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    showLoading()
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    hideLoading()
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    // Chỉ hiển thị lỗi cho main frame
                    if (request?.isForMainFrame == true) {
                        showError("Không thể tải trang")
                    }
                }

                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    // Cho phép WebView xử lý tất cả URL
                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    binding.progressBar.progress = newProgress
                    if (newProgress == 100) {
                        binding.progressBar.visibility = View.GONE
                    } else {
                        binding.progressBar.visibility = View.VISIBLE
                    }
                }

                override fun onReceivedTitle(view: WebView?, title: String?) {
                    super.onReceivedTitle(view, title)
                    // Có thể cập nhật title nếu cần
                }
            }
        }
    }

    private fun loadUrl() {
        hideError()
        binding.webView.loadUrl(currentUrl)
    }

    private fun showLoading() {
        binding.loadingOverlay.visibility = View.VISIBLE
        binding.webView.visibility = View.INVISIBLE
        binding.errorView.visibility = View.GONE
    }

    private fun hideLoading() {
        binding.loadingOverlay.visibility = View.GONE
        binding.webView.visibility = View.VISIBLE
    }

    private fun showError(message: String) {
        binding.errorView.visibility = View.VISIBLE
        binding.webView.visibility = View.GONE
        binding.loadingOverlay.visibility = View.GONE
        binding.tvErrorMessage.text = message
    }

    private fun hideError() {
        binding.errorView.visibility = View.GONE
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }
}

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const example = urlParams.get('example');
    const page = urlParams.get('page') || 'home';

    // Sayfa yükleme
    loadPage(page, example);

    // Menü tıklamaları
    $('.nav-item a').click(function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const newPage = href.replace('pages/', '').replace('.html', '');
        
        // Practices sayfası hariç, diğer sayfalarda ilk kartı seç
        if (newPage === 'jquery-basics') {
            window.location.href = `?page=${newPage}&example=setup`;
        } else if (newPage === 'jquery-manipulation') {
            window.location.href = `?page=${newPage}&example=manipulation`;
        } else if (newPage === 'jquery-effects') {
            window.location.href = `?page=${newPage}&example=visibility_effects`;
        } else {
            window.location.href = `?page=${newPage}`;
        }
    });
});

function loadPage(page, example) {
    // Aktif menü öğesini güncelle
    $('.nav-item').removeClass('active');
    $(`.nav-item a[href="pages/${page}.html"]`).parent().addClass('active');

    // Ana içeriği yükle
    $('#mainContent').load(`pages/${page}.html`, function() {
        Prism.highlightAll();
        
        if (page === 'jquery-basics' || page === 'jquery-manipulation' || page === 'jquery-effects') {
            // Eğer örnek belirtilmemişse, sayfaya göre varsayılan örneği seç
            if (!example) {
                const defaultExample = page === 'jquery-basics' ? 'setup' : 
                                     page === 'jquery-manipulation' ? 'manipulation' : 
                                     'visibility_effects';
                window.location.href = `?page=${page}&example=${defaultExample}`;
                return;
            }
            initializePlayground(page, example);
        }
    });
}

function initializePlayground(page, activeExample) {
    // JSON verilerini yükle
    $.getJSON('./data/cards.json', function(cards) {
        $.getJSON('./data/examples.json', function(examples) {
            // Kartları yükle
            loadCards(page, cards, activeExample);
            
            // Eğer aktif örnek varsa, editörleri başlat
            if (activeExample && examples[activeExample]) {
                initializeEditors(examples[activeExample]);
            }
        });
    });
}

function loadCards(page, cards, activeExample) {
    const $container = $('#codeExamples');
    let relevantCards = [];

    if (page === 'jquery-basics') {
        relevantCards = ['setup', 'ready', 'selectors', 'events', 'xml', 'json'];
    } else if (page === 'jquery-manipulation') {
        relevantCards = ['manipulation', 'dom_manipulation', 'attribute_manipulation', 'ajax', 'getpost', 'getjson', 'debounce_throttle', 'cache'];
    } else if (page === 'jquery-effects') {
        relevantCards = ['visibility_effects', 'fade_effects', 'slide_effects', 'animate_effects', 'queue_effects', 'fancybox_plugin', 'slick_plugin', 'custom_plugin', 'validate_plugin', 'datepicker_plugin', 'masonry_plugin'];
    }

    relevantCards.forEach(key => {
        if (cards[key]) {
            const card = cards[key];
            const isActive = key === activeExample;
            
            const cardHtml = `
                <div class="code-example ${isActive ? 'active' : ''}" data-example="${key}">
                    <div class="example-header">
                        <h3>${card.title}</h3>
                        <a href="?page=${page}&example=${key}" class="select-example">
                            <i class="fas fa-check"></i> Seç
                        </a>
                    </div>
                    <p>${card.description}</p>
                    <pre><code class="language-${card.code.language}">${card.code.content}</code></pre>
                </div>
            `;
            
            $container.append(cardHtml);
        }
    });

    Prism.highlightAll();
}

function initializeEditors(example) {
    // Başlık ve açıklamayı güncelle
    $('#exampleTitle').text(example.title);
    $('#exampleDesc').text(example.description);

    // HTML editörünü başlat
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true
    });

    // JavaScript editörünü başlat
    const jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true
    });

    // Editör içeriklerini ayarla
    if (example.html) {
        $('#htmlSection').show();
        $('#playgroundContainer').removeClass('single-editor');
        htmlEditor.setValue(example.html);
    } else {
        $('#htmlSection').hide();
        $('#playgroundContainer').addClass('single-editor');
    }
    
    jsEditor.setValue(example.js);

    // Run Code butonunu ayarla
    $('#runCode').click(function() {
        const completeCode = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>jQuery Example</title>
                <style>${example.css || ''}</style>
                <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
                ${example.html ? '' : '<script>' + jsEditor.getValue() + '</script>'}
            </head>
            <body>
                ${example.html ? htmlEditor.getValue() : example.html}
                ${example.html ? '<script>' + jsEditor.getValue() + '</script>' : ''}
            </body>
            </html>
        `;
        
        const iframe = document.getElementById('previewFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        iframeDoc.open();
        iframeDoc.write(completeCode);
        iframeDoc.close();
    });

    // Otomatik çalıştır
    $('#runCode').click();
}

function checkjQuery() {
    const jqueryVersion = window.jQuery ? jQuery.fn.jquery : null;
    const versionElement = $("#jqueryVersion");
    const messageElement = $("#setupMessage");
    const exampleElement = $("#setupExample");
    const testButton = $("#testSetup");
    
    if (!jqueryVersion) {
        versionElement.text("jQuery Yüklü Değil!")
            .css("color", "#dc3545");
        
        messageElement.text("jQuery'yi yüklemek için HTML koduna jQuery CDN'ini ekleyin:")
            .css("color", "#666");
        
        exampleElement.html(
            '<pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">' +
            '&lt;script src="https://code.jquery.com/jquery-3.7.1.min.js"&gt;&lt;/script&gt;' +
            '</pre>'
        ).show();
        
        testButton.text("jQuery Yüklü Değil")
            .prop("disabled", true)
            .css({
                "background-color": "#ccc",
                "cursor": "not-allowed"
            });
    } else {
        versionElement.text(jqueryVersion)
            .css("color", "#4CAF50");
        
        messageElement.text("jQuery başarıyla yüklendi! Test etmek için butona tıklayın.")
            .css("color", "#4CAF50");
        
        exampleElement.hide();
        
        testButton.text("Test Et")
            .prop("disabled", false)
            .css({
                "background-color": "#4CAF50",
                "cursor": "pointer"
            })
            .click(function() {
                $(this).text("jQuery Çalışıyor! 🎉")
                    .addClass("success");
            });
    }
}

$(document).ready(function() {
    checkjQuery();
}); 
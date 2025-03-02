$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const example = urlParams.get('example');

    if (example) {
        $('.nav-item').removeClass('active');
        $('.nav-item a[href="pages/jquery-basics.html"]').parent().addClass('active');
        $('#mainContent').load('pages/jquery-basics.html', function() {
            Prism.highlightAll();
            initializePlayground();
        });
    } else {
        $('#mainContent').load('pages/home.html', function() {
            Prism.highlightAll();
        });
    }

    $('.nav-item a').click(function(e) {
        e.preventDefault();
        
        $('.nav-item').removeClass('active');

        $(this).parent().addClass('active');
        
        // Load the page content
        const href = $(this).attr('href');
        $('#mainContent').load(href, function() {
            Prism.highlightAll();
            if (href === 'pages/jquery-basics.html') {
                initializePlayground();
            }
        });
    });
});

function initializePlayground() {
    let cards = {};
    let examples = {};

    $.getJSON('./data/cards.json', function(cardsData) {
        cards = cardsData;
        loadCards();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('cards.json yüklenemedi:', textStatus, errorThrown);
    });

    $.getJSON('./data/examples.json', function(examplesData) {
        examples = examplesData;
        initializeEditors();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('examples.json yüklenemedi:', textStatus, errorThrown);
    });

    function loadCards() {
        const $container = $('#codeExamples');
        $container.empty();

        Object.entries(cards).forEach(([key, card]) => {
            const cardHtml = `
                <div class="code-example" data-example="${key}">
                    <div class="example-header">
                        <h3>${card.title}</h3>
                        <button class="select-example">
                            <i class="fas fa-check"></i> Seç
                        </button>
                    </div>
                    <p>${card.description}</p>
                    <pre><code class="language-${card.code.language}"></code></pre>
                </div>
            `;
            
            const $card = $(cardHtml);
            $card.find('code').text(card.code.content);
            $container.append($card);
        });

        setTimeout(() => {
            Prism.highlightAll();
        }, 100);

        $('.select-example').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const example = $(this).closest('.code-example').data('example');
            window.location.href = window.location.pathname + '?example=' + example;
        });

        const urlParams = new URLSearchParams(window.location.search);
        const activeExample = urlParams.get('example') || 'setup';
        $(`.code-example[data-example="${activeExample}"]`).addClass('active');
    }

    function initializeEditors() {
        const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
            mode: 'xml',
            theme: 'monokai',
            lineNumbers: true
        });

        const jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
            mode: 'javascript',
            theme: 'monokai',
            lineNumbers: true
        });

        const urlParams = new URLSearchParams(window.location.search);
        const activeExample = urlParams.get('example') || 'setup';
        const exampleData = examples[activeExample];

        if (!exampleData) return;

        if (activeExample === 'ready') {
            $('#htmlSection').hide();
            $('#playgroundContainer').addClass('single-editor');
            jsEditor.setValue(exampleData.js);
        } else {
            $('#htmlSection').show();
            $('#playgroundContainer').removeClass('single-editor');
            htmlEditor.setValue(exampleData.html);
            jsEditor.setValue(exampleData.js);
        }

        $('#exampleTitle').text(exampleData.title);
        $('#exampleDesc').text(exampleData.description);

        $('#runCode').click(function() {
            if (activeExample === 'ready') {
                const completeCode = exampleData.html.replace('</head>', `
                    <style>${exampleData.css}</style>
                    <script>${jsEditor.getValue()}<\/script>
                    </head>
                `);
                
                const iframe = document.getElementById('previewFrame');
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                iframeDoc.open();
                iframeDoc.write(completeCode);
                iframeDoc.close();
            } else {
                const html = htmlEditor.getValue();
                const js = jsEditor.getValue();

                if (!html.includes('jquery')) {
                    alert('Lütfen önce HTML koduna jQuery kütüphanesini ekleyin!\n\nÖrnek:\n<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>');
                    return;
                }

                const completeCode = html.replace('</head>', `
                    <style>${exampleData.css}</style>
                    <script>${js}<\/script>
                    </head>
                `);

                const iframe = document.getElementById('previewFrame');
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                iframeDoc.open();
                iframeDoc.write(completeCode);
                iframeDoc.close();
            }
        });

        $('#runCode').click();
    }
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
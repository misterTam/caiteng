(function(){
  const PDFJS_VERSION = '3.11.174';
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if(pdfjsLib){
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.staticfile.org/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
  }

  function isMobile(){ return (window.matchMedia && matchMedia('(max-width: 768px)').matches) || (window.innerWidth <= 768); }

  async function renderPageToCanvas(pdf, pageNum, scale, parentEl){
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.className = 'pdfjs-page';
    const context = canvas.getContext('2d');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    parentEl.appendChild(canvas);
    await page.render({ canvasContext: context, viewport }).promise;
  }

  async function renderPDF(pdfUrl, mountEl, options = {}){
    if(!pdfjsLib){
      mountEl.textContent = 'PDF 内嵌组件加载失败，请刷新重试';
      return false;
    }
    const {
      initialPages = 1,
      scaleMobile = 1.0,
      scaleDesktop = 1.25,
      lazy = true
    } = options;

    mountEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'pdfjs-container';
    mountEl.appendChild(container);

    const hint = document.createElement('div');
    hint.className = 'small muted';
    hint.textContent = '正在加载…';
    container.appendChild(hint);

    try{
      const loadingTask = pdfjsLib.getDocument({ url: encodeURI(pdfUrl) });
      const pdf = await loadingTask.promise;
      const scale = isMobile() ? scaleMobile : scaleDesktop;

      // Remove hint after we start rendering
      hint.remove();

      // Render first N pages quickly
      const firstCount = Math.min(initialPages, pdf.numPages);
      for(let p = 1; p <= firstCount; p++){
        // eslint-disable-next-line no-await-in-loop
        await renderPageToCanvas(pdf, p, scale, container);
      }

      if(!lazy || firstCount >= pdf.numPages){
        for(let p = firstCount + 1; p <= pdf.numPages; p++){
          // eslint-disable-next-line no-await-in-loop
          await renderPageToCanvas(pdf, p, scale, container);
        }
        return true;
      }

      // Lazy render remaining pages when scrolled into view
      const io = ('IntersectionObserver' in window) ? new IntersectionObserver(async (entries) => {
        for(const entry of entries){
          if(entry.isIntersecting){
            const placeholder = entry.target;
            io.unobserve(placeholder);
            const pageNum = Number(placeholder.getAttribute('data-page'));
            const parent = placeholder.parentElement;
            placeholder.remove();
            await renderPageToCanvas(pdf, pageNum, scale, parent);
          }
        }
      }, { root: null, rootMargin: '200px 0px', threshold: 0.01 }) : null;

      for(let p = firstCount + 1; p <= pdf.numPages; p++){
        const ph = document.createElement('div');
        ph.className = 'pdfjs-page placeholder';
        ph.setAttribute('data-page', String(p));
        ph.style.width = '100%';
        ph.style.minHeight = '60vh';
        ph.style.background = '#f8fafc';
        ph.style.border = '1px dashed #e2e8f0';
        ph.style.borderRadius = '6px';
        ph.style.display = 'flex';
        ph.style.alignItems = 'center';
        ph.style.justifyContent = 'center';
        ph.style.color = '#64748b';
        ph.textContent = `加载第 ${p} 页…`;
        container.appendChild(ph);
        if(io){ io.observe(ph); } else {
          // Fallback: idle rendering
          setTimeout(async ()=>{
            if(ph.isConnected){
              const parent = ph.parentElement; ph.remove();
              await renderPageToCanvas(pdf, p, scale, parent);
            }
          }, (p - firstCount) * 300);
        }
      }

      return true;
    }catch(err){
      console.error(err);
      container.textContent = 'PDF 加载失败，请检查文件是否存在或稍后重试。';
      return false;
    }
  }

  window.renderPDF = renderPDF;
})(); 
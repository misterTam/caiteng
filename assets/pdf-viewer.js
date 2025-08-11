(function(){
  const PDFJS_VERSION = '3.11.174';
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if(pdfjsLib){
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
  }

  async function renderPDF(pdfUrl, mountEl){
    if(!pdfjsLib){
      mountEl.textContent = 'PDF 内嵌组件加载失败，请刷新重试';
      return;
    }
    mountEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'pdfjs-container';
    mountEl.appendChild(container);

    try{
      const loadingTask = pdfjsLib.getDocument({ url: encodeURI(pdfUrl) });
      const pdf = await loadingTask.promise;
      for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement('canvas');
        canvas.className = 'pdfjs-page';
        const context = canvas.getContext('2d');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        // Make it responsive
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        container.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    }catch(err){
      console.error(err);
      container.textContent = 'PDF 加载失败，请检查文件是否存在或稍后重试。';
    }
  }

  window.renderPDF = renderPDF;
})(); 
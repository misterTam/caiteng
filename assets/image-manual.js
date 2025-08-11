(function(){
  async function renderImageManual(manifestUrl, mountEl){
    try{
      const res = await fetch(`${manifestUrl}?_=${Date.now()}`);
      if(!res.ok) return false;
      const data = await res.json();
      const files = Array.isArray(data) ? data : (data.files || []);
      const base = (Array.isArray(data) ? '' : (data.basePath || ''));
      if(!files || files.length === 0) return false;

      mountEl.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'pdfjs-container';
      mountEl.appendChild(container);

      for(const file of files){
        const src = base ? `${base.replace(/\/$/,'')}/${file}` : file;
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.alt = '说明书页面';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '6px';
        img.style.boxShadow = '0 1px 3px rgba(2,8,23,0.08)';
        img.style.marginBottom = '12px';
        container.appendChild(img);
      }
      return true;
    }catch(err){
      console.error(err);
      return false;
    }
  }

  window.renderImageManual = renderImageManual;
})(); 
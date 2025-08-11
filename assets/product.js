(async function(){
  const root = window.__ROOT_PATH__ || '..';
  const params = new URLSearchParams(location.search);
  const productId = params.get('id');

  const brandEl = document.getElementById('brandName');
  const titleEl = document.getElementById('productTitle');
  const skuEl = document.getElementById('productSku');
  const heroEl = document.getElementById('heroImage');
  const manualEl = document.getElementById('manualContainer');
  const videoEl = document.getElementById('videoContainer');
  const formProductId = document.getElementById('productIdInput');
  const waBtn = document.getElementById('whatsappBtn');

  function toYouTubeEmbed(url){
    try{
      const u = new URL(url);
      if(u.hostname.includes('youtu.be')){
        const id = u.pathname.replace(/^\//,'');
        return `https://www.youtube.com/embed/${id}`;
      }
      if(u.hostname.includes('youtube.com')){
        if(u.pathname === '/watch' && u.searchParams.get('v')){
          return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
        }
        if(u.pathname.startsWith('/embed/')) return url;
      }
    }catch{}
    return url;
  }

  try{
    const config = await window.App.loadSiteConfig(root);
    document.title = `${config.siteName} - 产品说明书`;
    if(brandEl) brandEl.textContent = config.siteName;
    if(waBtn) waBtn.href = config.whatsAppLink || '#';
  }catch{}

  if(!productId){
    titleEl.textContent = '未指定产品';
    manualEl.textContent = '链接缺少 ?id= 参数，请联系卖家或客服获取正确二维码。';
    videoEl.textContent = '';
    return;
  }

  const modalCtrl = window.App.initModal();
  window.App.initContactForm(root);

  try{
    const products = await window.App.loadProducts(root);
    const product = products.find(p => p.id === productId);

    if(!product){
      titleEl.textContent = '未找到该产品';
      manualEl.textContent = '请核对二维码或联系技术支持。';
      videoEl.textContent = '';
      return;
    }

    document.title = `${product.name} - 电子说明书`;
    titleEl.textContent = product.name;
    skuEl.textContent = product.sku ? `型号：${product.sku}` : '';
    heroEl.style.backgroundImage = product.heroImage ? `url('${product.heroImage}')` : '';
    if(formProductId) formProductId.value = product.id;

    // Render PDF manual
    manualEl.innerHTML = '';
    const pdfUrl = (product.pdfUrl || '').trim();
    if(pdfUrl){
      const container = document.createElement('div');
      container.className = 'pdf-container';
      const frame = document.createElement('iframe');
      frame.src = pdfUrl;
      frame.title = `${product.name} 说明书 (PDF)`;
      frame.loading = 'lazy';
      frame.setAttribute('aria-label', 'PDF 说明书');
      frame.style.border = '0';
      container.appendChild(frame);
      manualEl.appendChild(container);

      const actions = document.createElement('div');
      actions.className = 'pdf-actions';
      actions.innerHTML = `<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="${pdfUrl}">在新窗口打开 PDF</a>`;
      manualEl.appendChild(actions);
    }else{
      manualEl.textContent = '未配置该产品的 PDF 说明书，请联系技术支持。';
    }

    // Render video
    videoEl.innerHTML = '';
    const url = (product.videoUrl||'').trim();
    if(url){
      const embedUrl = toYouTubeEmbed(url);
      if(/youtube\.com\/embed\//i.test(embedUrl)){
        const embed = document.createElement('iframe');
        embed.src = embedUrl;
        embed.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        embed.allowFullscreen = true;
        embed.frameBorder = '0';
        videoEl.appendChild(embed);
      }else if(/\.mp4($|\?)/i.test(url)){
        const video = document.createElement('video');
        video.src = url; video.controls = true; video.playsInline = true;
        videoEl.appendChild(video);
      }else{
        const link = document.createElement('a');
        link.href = url; link.textContent = '点击查看视频'; link.target = '_blank';
        videoEl.appendChild(link);
      }
      videoEl.classList.remove('muted');
    }else{
      videoEl.textContent = '暂无视频';
      videoEl.classList.add('muted');
    }

    // Auto open contact modal once per session for this product
    setTimeout(()=>{ modalCtrl.open?.(); }, 800);
  }catch(err){
    console.error(err);
    titleEl.textContent = '加载失败';
    manualEl.textContent = '系统开小差了，请稍后再试。';
  }
})(); 
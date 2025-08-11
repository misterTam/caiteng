(function(){
  const App = {};

  App.loadSiteConfig = async function loadSiteConfig(root){
    const url = `${root}/site.config.json?_=${Date.now()}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('无法加载站点配置');
    return await res.json();
  };

  App.loadProducts = async function loadProducts(root){
    const url = `${root}/data/products.json?_=${Date.now()}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('无法加载产品列表');
    return await res.json();
  };

  App.showToast = function showToast(message){
    const el = document.getElementById('toast');
    if(!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(App.__toastTimer);
    App.__toastTimer = setTimeout(()=> el.classList.remove('show'), 2400);
  };

  App.initModal = function initModal(){
    const modal = document.getElementById('contactModal');
    if(!modal) return { open(){}, close(){} };

    const openers = document.querySelectorAll('[data-open-contact]');
    const closers = modal.querySelectorAll('[data-close-modal]');

    function open(){
      modal.setAttribute('aria-hidden','false');
      const firstInput = modal.querySelector('input,textarea,button');
      if(firstInput) setTimeout(()=> firstInput.focus(), 0);
      document.addEventListener('keydown', onKey);
    }
    function close(){
      modal.setAttribute('aria-hidden','true');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e){ if(e.key === 'Escape') close(); }

    openers.forEach(btn => btn.addEventListener('click', open));
    closers.forEach(btn => btn.addEventListener('click', close));
    modal.querySelector('.modal-backdrop')?.addEventListener('click', close);

    return { open, close };
  };

  App.initContactForm = async function initContactForm(root){
    const form = document.getElementById('contactForm');
    if(!form) return;
    const config = await App.loadSiteConfig(root).catch(()=>({}));

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const data = new FormData(form);

      const name = (data.get('name')||'').toString().trim();
      const phone = (data.get('phone')||'').toString().trim();
      const email = (data.get('email')||'').toString().trim();
      const social = (data.get('socialAccount')||'').toString().trim();

      if(!name){ App.showToast('请填写姓名'); return; }
      if(!phone && !email && !social){
        App.showToast('请至少填写电话、邮箱、或社交账号中的一项');
        return;
      }

      data.append('_subject', '新的安装指导线索');
      data.append('_format', 'json');

      const endpoint = config.formEndpoint;
      if(!endpoint || !/^https?:\/\//i.test(endpoint)){
        App.showToast('表单端点未配置，已暂存到本地');
        try{
          const drafts = JSON.parse(localStorage.getItem('contactDrafts')||'[]');
          drafts.push(Object.fromEntries(data.entries()));
          localStorage.setItem('contactDrafts', JSON.stringify(drafts));
        }catch{}
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '提交中…'; }

      try{
        const res = await fetch(endpoint, {
          method:'POST',
          body: data,
          headers: { 'Accept':'application/json' }
        });
        if(res.ok){
          App.showToast('提交成功，我们将在 24 小时内联系您');
          form.reset();
          document.querySelector('[data-close-modal]')?.click();
          const waBtn = document.getElementById('whatsappBtn');
          if(waBtn && waBtn.href) waBtn.classList.add('btn-primary');
        }else{
          App.showToast('提交失败，请稍后再试');
        }
      }catch(err){
        console.error(err);
        App.showToast('网络异常，请稍后再试');
      }finally{
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalText; }
      }
    });
  };

  window.App = App;
})(); 
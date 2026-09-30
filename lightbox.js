/* Shared image preview: native dialog provides keyboard focus containment. */
(() => {
  const links = [...document.querySelectorAll('a[href]')].filter(a => a.querySelector('img') && /\.(png|webp|jpe?g)(?:[?#].*)?$/i.test(a.getAttribute('href')));
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label','Image preview');
  dialog.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image preview" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const figure = dialog.querySelector('figure');
  const caption = dialog.querySelector('figcaption');
  let origin = null, busy = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function originTransform() {
    if (!origin) return 'scale(.96)';
    const from = origin.querySelector('img').getBoundingClientRect();
    const to = image.getBoundingClientRect();
    if (!to.width || !from.width) return 'scale(.96)';
    return `translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${from.width/to.width},${from.height/to.height})`;
  }
  async function close() {
    if (!dialog.open || busy) return;
    busy=true;
    if (!reduced()) {
      await image.animate([{transform:'none',opacity:1},{transform:originTransform(),opacity:0}],{duration:220,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.catch(()=>{});
    }
    dialog.close();
    image.getAnimations().forEach(animation=>animation.cancel());
    document.body.classList.remove('image-lightbox-open');
    origin?.focus({preventScroll:true});
    busy=false;
  }
  links.forEach(link => {
    link.removeAttribute('target');
    link.setAttribute('aria-haspopup','dialog');
    const thumbnail=link.querySelector('img');
    link.setAttribute('aria-label',`Enlarge ${thumbnail.alt || 'sample image'}`);
    link.addEventListener('click', async event => {
      if (event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
      event.preventDefault();
      if (dialog.open) return;
      origin=link;busy=false;
      image.src=link.href;image.alt=thumbnail.alt;
      caption.textContent=link.querySelector('span:not(.image-open)')?.textContent || thumbnail.alt;
      dialog.setAttribute('aria-label',`Image preview: ${thumbnail.alt || 'work sample'}`);
      document.body.classList.add('image-lightbox-open');
      dialog.showModal();
      try {await image.decode();} catch {}
      if (!dialog.open) return;
      if (!reduced()) image.animate([{transform:originTransform(),opacity:.3},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.75,.25,1)'});
    });
  });
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog) close();});
})();

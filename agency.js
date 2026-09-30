/* Progressive enhancement: navigation, FAQ and email links work without this file. */
const config = window.PORTFOLIO_CONFIG || {};
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const email = config.email || 'almadro.mich@gmail.com';
// Open webmail directly; no installed mail application or protocol handler is needed.
function gmailDraft(subject, message) {
  const params = new URLSearchParams({view:'cm',fs:'1',to:email,su:subject,body:message});
  return 'https://mail.google.com/mail/?'+params.toString();
}
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-email-booking]').forEach(link => {
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.href = config.bookingUrl || gmailDraft('Inquiry | Virtual Assistance', 'Hi Michelle,\n\nI would like to connect about virtual assistance.\n\nMy needs:\nMy timezone and preferred times:\n\nThank you!');
});
if (config.bookingUrl) document.querySelectorAll('.nav-cta, .actions .primary, .section-action .primary').forEach(a => { a.href = config.bookingUrl; });
if (config.formspreeEndpoint) {
  form.querySelector('button[type="submit"]').textContent = 'Send My Request';
  form.querySelector('.form-note').textContent = 'Your request will be sent securely through Formspree. Please do not include passwords or sensitive customer data.';
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `Hi Michelle,\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nBudget: ${data.get('budget')}\n\nI need help with:\n${data.get('needs')}\n\nI'd like to connect about virtual assistance.\n`;
  const fallback = document.querySelector('#email-fallback');
  document.querySelector('#prepared-message').value = message;
  if (!config.formspreeEndpoint) {
    const draftUrl = gmailDraft('Inquiry | Virtual Assistance', message);
    //status.textContent = 'Opening Gmail in a new tab. Review your draft and press Send there. No message has been sent yet.';
    fallback.hidden = false;
    const retry = document.querySelector('#open-gmail-draft');
    retry.href = draftUrl;
    retry.hidden = false;
    // Run synchronously within the submit gesture so the browser can allow the new tab.
    const draftTab = window.open('about:blank', '_blank');
    if (draftTab) {
      draftTab.opener = null;
      draftTab.location.replace(draftUrl);
    } else {
      status.textContent = 'Your browser blocked the new tab. Use Open draft in Gmail below, or copy the message. No email has been sent.';
    }
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true; status.textContent = 'Sending your request…';
  try {
    const response = await fetch(config.formspreeEndpoint, {method:'POST',body:data,headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error('Submission failed');
    status.textContent = 'Thank you—your request has been sent. Michelle will reply by email.';
    form.reset(); fallback.hidden = true;
  } catch {
    status.textContent = 'Your request could not be sent. Please copy the message below and email it to Michelle.';
    fallback.hidden = false;
  } finally { button.disabled = false; }
});
document.querySelector('.copy-message').addEventListener('click', async () => {
  const draft = document.querySelector('#prepared-message');
  try { await navigator.clipboard.writeText(draft.value); status.textContent = 'Message copied. Paste it into an email and send it to Michelle.'; }
  catch { draft.focus(); draft.select(); status.textContent = 'Select and copy the message below, then send it by email.'; }
});
/* Analytics remains off until configured AND consent has been granted. */
/* Work carousel: no autoplay. Supports arrow buttons, arrow keys and native touch swiping. */
const track = document.querySelector('#work-track');
if (track) {
  const slides = Array.from(track.querySelectorAll('.work-slide'));
  const previous = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const counter = document.querySelector('.carousel-status');
  let active = 0;
  function update() {
    active = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    counter.textContent = slides[active].querySelector('h3').textContent;
  }
  function go(direction) {
    const index = Math.max(0,Math.min(slides.length-1,active+direction));
    track.scrollTo({left:track.clientWidth * index, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click',()=>go(-1));
  next.addEventListener('click',()=>go(1));
  track.addEventListener('keydown',event=>{
    if (event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();go(event.key==='ArrowLeft'?-1:1);}
  });
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',()=>{track.scrollTo({left:track.clientWidth*active,behavior:'instant'});update();});
  update();
}

if (config.analyticsConsent && /^G-[A-Z0-9]+$/.test(config.ga4MeasurementId)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', config.ga4MeasurementId);
  const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4MeasurementId);document.head.append(s);
}
if (config.analyticsConsent && /^\d+$/.test(config.metaPixelId)) {
  window.fbq=function(){window.fbq.queue.push(arguments)};window.fbq.queue=[];window.fbq.loaded=true;window.fbq.version='2.0';window._fbq=window.fbq;
  const s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(s);fbq('init',config.metaPixelId);fbq('track','PageView');
}

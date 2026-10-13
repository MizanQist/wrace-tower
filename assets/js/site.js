(function(){
  'use strict';
  var d=document,w=window; d.documentElement.classList.add('js');
  var prog=d.getElementById('prog'), pg=d.getElementById('pg'), pages=[].slice.call(d.querySelectorAll('.page'));
  var total=pages.length;
  function onScroll(){
    var y=w.pageYOffset,h=d.documentElement.scrollHeight-w.innerHeight; prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    var mid=y+w.innerHeight*.45,k=0; for(var i=0;i<pages.length;i++){ if(pages[i].offsetTop<=mid) k=i; }
    pg.textContent=pages[k].getAttribute('data-n')+' / '+(total<10?'0':'')+total;
    d.getElementById('bar').classList.toggle('on-cover', k===0);
  }
  w.addEventListener('scroll',onScroll,{passive:true}); w.addEventListener('resize',onScroll); onScroll();
  var els=[].slice.call(d.querySelectorAll('.rv'));
  if('IntersectionObserver' in w){ var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target);} }); },{threshold:.1}); els.forEach(function(e){ io.observe(e); }); }
  else els.forEach(function(e){ e.classList.add('in'); });

  /* ——— lightbox: every image in the book opens full screen ——— */
  var imgs=[].slice.call(d.querySelectorAll('main img')), lb=d.createElement('div'); lb.className='lb'; lb.hidden=true;
  lb.innerHTML='<button class="lb-x" type="button" aria-label="Close">Close</button><button class="lb-p" type="button" aria-label="Previous">&larr;</button><button class="lb-n" type="button" aria-label="Next">&rarr;</button><figure><img alt=""><figcaption></figcaption></figure>';
  d.body.appendChild(lb); var lbi=lb.querySelector('img'), lbc=lb.querySelector('figcaption'), cur=-1;
  function cap(im){ var f=im.closest('figure'); var c=f&&f.querySelector('figcaption'); return c?c.textContent:(im.alt||''); }
  function show(i){ cur=(i+imgs.length)%imgs.length; var im=imgs[cur]; lbi.src=im.currentSrc&&im.currentSrc.indexOf('/t/')<0?im.src:im.src; lbi.srcset=im.getAttribute('srcset')||''; lbi.sizes='100vw'; lbi.alt=im.alt; lbc.textContent=cap(im); lb.hidden=false; d.body.style.overflow='hidden'; }
  function hide(){ lb.hidden=true; d.body.style.overflow=''; if(cur>=0) imgs[cur].focus(); }
  imgs.forEach(function(im,i){ im.tabIndex=0; im.setAttribute('role','button'); im.classList.add('zoom'); im.addEventListener('click',function(){ show(i); }); im.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(i);} }); });
  lb.querySelector('.lb-x').addEventListener('click',hide); lb.querySelector('.lb-p').addEventListener('click',function(){ show(cur-1); }); lb.querySelector('.lb-n').addEventListener('click',function(){ show(cur+1); });
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target===lbi.parentNode) hide(); });
  d.addEventListener('keydown',function(e){ if(lb.hidden) return; if(e.key==='Escape') hide(); if(e.key==='ArrowLeft') show(cur-1); if(e.key==='ArrowRight') show(cur+1); });
  var tx=null; lb.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; },{passive:true}); lb.addEventListener('touchend',function(e){ if(tx===null) return; var dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) show(cur+(dx<0?1:-1)); tx=null; });
})();

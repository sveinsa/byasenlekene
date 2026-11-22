/* =====================================================================
   DEL 5: OPPSTART
   ===================================================================== */
buildBackdrop();
resize();
Snd.muted = store.get('muted', false);
document.getElementById('bMute').innerHTML = Snd.muted ? '&#128263;' : '&#128266;';
document.getElementById('bMute').addEventListener('pointerdown', e => { e.preventDefault(); Snd.init(); Snd.setMuted(!Snd.muted); });
$('bPause').addEventListener('pointerdown', e => { e.preventDefault(); Snd.init(); Input.press('p'); setTimeout(() => Input.release('p'), 60); });
document.getElementById('bFs').addEventListener('pointerdown', e => {
  e.preventDefault(); Snd.init();
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); try { screen.orientation.lock('landscape').catch(() => { }); } catch (_) { } }
    else (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } catch (err) { }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { Input.releaseAll(); Game.pause(true); Music.stop(); try { Snd.ctx && Snd.ctx.suspend(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } }
  else { try { Snd.ctx && Snd.ctx.resume(); } catch (e) { } if (Scenes.cur instanceof TitleScene) Music.play('title'); }
});
/* PWA: service worker (hoppes stille over der det ikke støttes, f.eks. file:// eller sandkasse) */
try { if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { }); } catch (e) { }
Scenes.go(new TitleScene());
requestAnimationFrame(frame);

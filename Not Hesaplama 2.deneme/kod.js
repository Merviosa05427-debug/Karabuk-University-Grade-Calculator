document.addEventListener('DOMContentLoaded', () => {
  const butInput = document.getElementById('but');
  const finalInput = document.getElementById('final');
  const finalGroup = document.getElementById('finalGroup');
  const finalHint = document.getElementById('finalHint');
  const sinavaGirdiCheckbox = document.getElementById('sinavaGirdi');
  const devamsizCheckbox = document.getElementById('devamsiz');

  // Bütünleme girildiğinde Final'i kapat
  butInput.addEventListener('input', () => {
    if (butInput.value.trim() !== '') {
      finalGroup.classList.add('disabled');
      finalInput.disabled = true;
      finalHint.textContent = 'Bütünleme notu girildiği için devre dışı.';
    } else {
      finalGroup.classList.remove('disabled');
      finalInput.disabled = false;
      finalHint.textContent = '0 – 100 arasında bir değer giriniz.';
    }
  });

  // Devamsızlık ve Sınava Girme onaylarının çakışmasını engelle
  devamsizCheckbox.addEventListener('change', () => {
    if (devamsizCheckbox.checked) {
      sinavaGirdiCheckbox.checked = false;
    }
  });

  sinavaGirdiCheckbox.addEventListener('change', () => {
    if (sinavaGirdiCheckbox.checked) {
      devamsizCheckbox.checked = false;
    }
  });
});

function calculate() {
  const errorMsg = document.getElementById('errorMessage');
  const resultCard = document.getElementById('resultCard');
  
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
  resultCard.classList.add('hidden');

  const vizeVal = document.getElementById('vize').value;
  const yilIciVal = document.getElementById('yilIci').value;
  const finalVal = document.getElementById('final').value;
  const butVal = document.getElementById('but').value;
  const isDevamsiz = document.getElementById('devamsiz').checked;
  const isSinavaGirdi = document.getElementById('sinavaGirdi').checked;

  // 1. Devamsızlık Kontrolü (F1)
  if (isDevamsiz) {
    showResult(0, 'F1', 0.0, false, 'Devamsızlık nedeniyle dersten kaldınız (F1).');
    return;
  }

  // 2. Sınava Girmedi Kontrolü (F2)
  if (!isSinavaGirdi) {
    showResult(0, 'F2', 0.0, false, 'Genel / Bütünleme sınavına girmediğiniz için kaldınız (F2).');
    return;
  }

  // 3. Girdi Doğrulamaları
  if (vizeVal === '') {
    showError('Lütfen Vize / Ara Sınav notunu giriniz.');
    return;
  }

  const vize = parseFloat(vizeVal);
  if (isNaN(vize) || vize < 0 || vize > 100) {
    showError('Vize notu 0 ile 100 arasında olmalıdır.');
    return;
  }

  let yilIci = vize;
  if (yilIciVal !== '') {
    yilIci = parseFloat(yilIciVal);
    if (isNaN(yilIci) || yilIci < 0 || yilIci > 100) {
      showError('Yıl içi çalışma puanı 0 ile 100 arasında olmalıdır.');
      return;
    }
  }

  let sinavNotu = null;
  const hasBut = butVal.trim() !== '';

  if (hasBut) {
    sinavNotu = parseFloat(butVal);
    if (isNaN(sinavNotu) || sinavNotu < 0 || sinavNotu > 100) {
      showError('Bütünleme notu 0 ile 100 arasında olmalıdır.');
      return;
    }
  } else {
    if (finalVal === '') {
      showError('Lütfen Final notunu veya Bütünleme notunu giriniz.');
      return;
    }
    sinavNotu = parseFloat(finalVal);
    if (isNaN(sinavNotu) || sinavNotu < 0 || sinavNotu > 100) {
      showError('Final notu 0 ile 100 arasında olmalıdır.');
      return;
    }
  }

  // 4. Hesaplama Mantığı (%40 - %60)
  const basariNotu = (yilIci * 0.40) + (sinavNotu * 0.60);
  const sinavTuru = hasBut ? 'Bütünleme' : 'Final';

  // 5. Karabük Üniversitesi Kuralları
  if (sinavNotu < 50) {
    showResult(
      basariNotu, 
      'F3', 
      0.0, 
      false, 
      `${sinavTuru} sınav notunuz (${sinavNotu.toFixed(2)}) 50 barajının altında kaldığı için F3 ile kaldınız.`
    );
    return;
  }

  if (basariNotu < 60) {
    showResult(
      basariNotu, 
      'F3', 
      0.0, 
      false, 
      `Ders başarı notunuz (${basariNotu.toFixed(2)}) 60 geçme barajının altında kaldığı için F3 ile kaldınız.`
    );
    return;
  }

  // 6. Harf Notları
  let harf = '';
  let katsayi = 0.0;

  if (basariNotu >= 90) {
    harf = 'A1'; katsayi = 4.00;
  } else if (basariNotu >= 80) {
    harf = 'A2'; katsayi = 3.50;
  } else if (basariNotu >= 70) {
    harf = 'B1'; katsayi = 3.00;
  } else if (basariNotu >= 65) {
    harf = 'B2'; katsayi = 2.75;
  } else {
    harf = 'C'; katsayi = 2.50;
  }

  showResult(
    basariNotu, 
    harf, 
    katsayi, 
    true, 
    `Tebrikler! Tüm barajları geçerek ${harf} harf notu ile dersi başarıyla tamamladınız.`
  );
}

function showResult(basari, harf, katsayi, passed, desc) {
  const resultCard = document.getElementById('resultCard');
  const badge = document.getElementById('statusBadge');
  
  document.getElementById('basariNotuVal').textContent = basari.toFixed(2);
  document.getElementById('harfNotuVal').textContent = harf;
  document.getElementById('katsayiVal').textContent = katsayi.toFixed(2);
  document.getElementById('aciklamaVal').textContent = desc;

  if (passed) {
    badge.textContent = 'GEÇTİ';
    resultCard.className = 'result-card passed';
  } else {
    badge.textContent = 'KALDI';
    resultCard.className = 'result-card failed';
  }

  resultCard.classList.remove('hidden');
}

function showError(msg) {
  const errorMsg = document.getElementById('errorMessage');
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function resetForm() {
  document.getElementById('calcForm').reset();
  
  const finalGroup = document.getElementById('finalGroup');
  const finalInput = document.getElementById('final');
  const finalHint = document.getElementById('finalHint');
  
  finalGroup.classList.remove('disabled');
  finalInput.disabled = false;
  finalHint.textContent = '0 – 100 arasında bir değer giriniz.';
  
  document.getElementById('errorMessage').classList.add('hidden');
  document.getElementById('resultCard').classList.add('hidden');
}
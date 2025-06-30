let pusingan = 1;
let maxPusingan = 3;
let pemainSkor = 0;
let komputerSkor = 0;

let userId = "";

function login() {
  const nama = document.getElementById('username').value;
  if (nama.trim() === "") return alert("Sila masukkan nama!");

  firebase.auth().signInAnonymously()
    .then(() => {
      const user = firebase.auth().currentUser;
      userId = user.uid;

      firebase.database().ref('players/' + userId).set({
        nama: nama,
        skor: 0,
        timestamp: Date.now()
      });

      document.getElementById('login-section').style.display = 'none';
      document.getElementById('game-section').style.display = 'block';
      alert(`Selamat datang, ${nama}!`);
    })
    .catch((error) => {
      alert("Ralat log masuk: " + error.message);
    });
}

function pilih(pilihanPemain) {
  const pilihanKomputer = ["batu", "air", "cawan"][Math.floor(Math.random() * 3)];
  let keputusan = tentukanMenang(pilihanPemain, pilihanKomputer);

  if (keputusan === "menang") pemainSkor++;
  else if (keputusan === "kalah") komputerSkor++;

  const keputusanElemen = document.getElementById("keputusan");
  keputusanElemen.innerText = `Anda pilih ${pilihanPemain}, Komputer pilih ${pilihanKomputer} → Anda ${keputusan}`;
  keputusanElemen.style.color =
    keputusan === "menang" ? "green" :
    keputusan === "kalah" ? "red" : "orange";

  // 🔥 Tambah animasi
  keputusanElemen.classList.remove("victory");
  void keputusanElemen.offsetWidth; // trick untuk reset animasi
  keputusanElemen.classList.add("victory");

  document.getElementById("markah").innerText = `Skor Anda: ${pemainSkor} | Skor Komputer: ${komputerSkor}`;
  document.getElementById("status").innerText = `Pusingan: ${pusingan} dari ${maxPusingan}`;

  pusingan++;
  if (pusingan > maxPusingan) {
    akhirGame();
  }
}


function tentukanMenang(p1, p2) {
  if (p1 === p2) return "seri";
  if ((p1 === "batu" && p2 === "cawan") ||
      (p1 === "air" && p2 === "batu") ||
      (p1 === "cawan" && p2 === "air")) {
    return "menang";
  }
  return "kalah";
}

function akhirGame() {
  let msg;
  if (pemainSkor > komputerSkor) {
    msg = "Anda Menang!";
    simpanRekod(document.getElementById('username').value, 1, 0, 0);
  } else if (pemainSkor < komputerSkor) {
    msg = "Anda Kalah!";
    simpanRekod(document.getElementById('username').value, 0, 1, 0);
  } else {
    msg = "Seri!";
    simpanRekod(document.getElementById('username').value, 0, 0, 1);
  }

  alert(`Permainan Tamat! ${msg}`);
}

function simpanRekod(nama, menang, kalah, seri) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const userId = user.uid;
  const tarikh = new Date().toISOString().split('T')[0];

  firebase.database().ref('rekod/' + userId).set({
    nama: nama,
    menang: menang,
    kalah: kalah,
    seri: seri,
    tarikh: tarikh
  });
}

function paparSemuaRekod() {
  const list = document.getElementById("rekod-list");
  list.innerHTML = "";

  firebase.database().ref("rekod").once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const data = child.val();
      const item = document.createElement("li");
      item.innerText = `${data.nama} | Menang: ${data.menang}, Kalah: ${data.kalah}, Seri: ${data.seri} (${data.tarikh})`;
      list.appendChild(item);
    });
  });
}

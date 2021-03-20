var firebaseConfig = {
    apiKey: "AIzaSyBlTRsuFGybK9_cPJ_qCa47jkGpD9aGWC8",
    authDomain: "skladiste-acee8.firebaseapp.com",
    databaseURL: "https://skladiste-acee8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "skladiste-acee8",
    storageBucket: "skladiste-acee8.appspot.com",
    messagingSenderId: "728257331779",
    appId: "1:728257331779:web:2f112a575df77d87b84af6",
    measurementId: "G-RZS9LDH6WJ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

var oDb = firebase.database();
var oDbKorisnici = oDb.ref('korisnici');
var oDbArtikli = oDb.ref('artikli');
var oDbStanje = oDb.ref('stanje');


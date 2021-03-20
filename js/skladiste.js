
function DajDatum()
{
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	today = dd + '.' + mm + '.' + yyyy;
	return today;
}

/***********************************************************************************/
function RefreshStanje()
{
	oDbArtikli.on('value', function(sOdgovorPosluzitelja)
	{	
		var tablicaStanja = $("#tablica-stanje");
		sOdgovorPosluzitelja.forEach(function(snapshot)
		{
		var ArtiklKey = snapshot.key;
		var Artikl = snapshot.val();
		var kolicinaUlaz = 0;
		var IznosUlaz = 0;
		var KolicinaIzlaz = 0;
		var IznosIzlaz = 0;
		var PocetnoStanje = 0;
				oDbStanje.on('value', function(sOdgovorPosluzitelja2)
				{
					sOdgovorPosluzitelja2.forEach(function(snapshot3)
					{
						var StanjeKey = snapshot3.key;
						var Stanje = snapshot3.val();
						if(Artikl.naziv_artikla == Stanje.naziv_artikla)
						{
							kolicinaUlaz += Stanje.kolicina_ulaz * 1  //(kolicinaUlaz + Stanje.kolicina_ulaz);
							KolicinaIzlaz += Stanje.kolicina_izlaz * 1;
							IznosUlaz += Stanje.iznos_ulaz * 1;
							IznosIzlaz += Stanje.iznos_izlaz * 1;
							if(Stanje.tip_dokumenta == "PS")
							{
								PocetnoStanje = Stanje.pocetno_stanje;
								SifraArtikla = Stanje.sifra_artikla;
							}							
						}
					})
						tablicaStanja.find('tbody').append
						(					
											'<tr>'+
												'<td>'+ Artikl.sifra_artikla+'</td>'+
												'<td>'+ Artikl.naziv_artikla+'</td>'+
												'<td>'+ Artikl.jmj+'</td>'+
												'<td>'+ Artikl.cijena+'</td>'+
												'<td>'+ PocetnoStanje+'</td>'+
												'<td>'+ (PocetnoStanje*Artikl.cijena)+'</td>'+
												'<td>'+ kolicinaUlaz +'</td>'+
												'<td>'+ parseFloat(kolicinaUlaz*Artikl.cijena)+'</td>'+
												'<td>'+ KolicinaIzlaz+'</td>'+
												'<td>'+ parseFloat(KolicinaIzlaz*Artikl.cijena)+'</td>'+
												'<td>'+ ((PocetnoStanje+ kolicinaUlaz) - (KolicinaIzlaz)) +'</td>'+
												'<td>'+ parseFloat(Artikl.cijena*((PocetnoStanje + kolicinaUlaz) - KolicinaIzlaz))+'</td>'+
												'<td>'+ '<button type="button" onclick="ObrisiArtikl('+ArtiklKey+')" class="btn btn-default btnObrisi"><span class="fas fa-trash-alt"/>' + '</button>' +'</td>' +
												'<td>'+ '<button type="button" onclick="ModalUrediArtikl('+ArtiklKey+')" class="btn btn-default"><span class="fas fa-pencil-alt"/>' + '</button>' +'</td>' +												
											'</tr>'
						) 						
				})	

	})	
});
}


function ObrisiRedoveArtikli()
{
	$('#tablica-stanje tbody tr').remove();
}

function ModalUrediArtikl(ArtiklKey)
{	
	let ArtiklRef = oDb.ref('artikli/' + ArtiklKey); 

	ArtiklRef.once('value', function(oOdgovorPosluzitelja)
	{
		var oArtikl = oOdgovorPosluzitelja.val();
			// Popunjavanje elemenata forme za uređivanje
			console.log(oArtikl.naziv_artikla);
			$('#inptSifraArtikla').val(oArtikl.sifra_artikla);
			$('#inptNazivArtikla').val(oArtikl.naziv_artikla);
			$('#inptJedinicnaMjera').val(oArtikl.jmj);
			$('#inptCijena').val(oArtikl.cijena);

			document.getElementById("inptSifraArtikla").disabled = true;
			document.getElementById("inptNazivArtikla").disabled = true;

			$('#btnUrediArtikl').attr('onclick', 
			'UrediArtikl("'+ArtiklKey+'")');

			// Prikaži modal
			$('#urediArtikl').modal('show');
	});
}

function UrediArtikl(ArtiklKey)
{
	var answer = window.confirm("Da li ste sigurni?");
	var ArtiklRef = oDb.ref('artikli/'+ArtiklKey);
	if(answer)
	{
		ArtiklRef.once('value', function(sOdgovorPosluzitelja2)
		{
			aArtikl = sOdgovorPosluzitelja2.val();

			var sJedinicnaMjera = $('#inptJedinicnaMjera').val();
			var sCijena = $('#inptCijena').val();

			 var oArtikl = {
								'sifra_artikla': aArtikl.sifra_artikla,
								'naziv_artikla':aArtikl.naziv_artikla,
								'jmj':sJedinicnaMjera,
								'cijena' : parseFloat(sCijena)
							}
		ArtiklRef.update(oArtikl);
		ObrisiRedoveArtikli();
		RefreshStanje();
	});
	}
	else
	{
		return false;
	}
}


function ModalDodaj()
{	
		// Prikaži modal
		$('#dodajArtikl').modal('show');

		// Dodavanje događaja na gumb Ažuriraj
		$('#btnDodaj').attr('onclick',
		'DodajArtikl()');
}




function DodajArtikl()
{
	var sUrl = window.location.href ;
	var oUrl = new URL(sUrl);
	var sKorisnik = oUrl.searchParams.get("korisnik_id");
	var sSifraArtikla = $('#inptSifraArtikla2').val();
	var sNazivArtikla = $('#inptNazivArtikla2').val();
	var sJdm = $('#inptjdm2').val();
	var sCijena = $('#inptCijena2').val();
	var sPocetnoStanje = $('#inptPocetnoStanje2').val();
	var sTipDokumenta = "PS";
	var sKolicinaUlaz = 0;
	var sKolicinaIzlaz = 0;
	var sIznosUlaz = 0;
	var sIznosIzlaz = 0;
	var Datum = DajDatum();
	var Count = 0;
	var array =[];
	var Count2 = 0;
	var array2 =[];
	var Postoji = false;
	var Postoji2 = false;
	var answer = window.confirm("Da li ste sigurni?");
	if(sSifraArtikla == "" || sNazivArtikla == "" || sJdm == "" || sCijena == "" || sPocetnoStanje == "")
	{
		alert("Nisu popunjena sva polja");
		return false;
	}
	else if(answer)
	{
		oDbArtikli.once('value', function(sOdgovorPosluzitelja)
		{
			sOdgovorPosluzitelja.forEach(function(snapshot)
			{
				var ArtiklKey = snapshot.key;
				var Artikl = snapshot.val();
				array.push(Artikl.sifra_artikla);
				Count = array.length;
				Count += 1 * 1;
				Count = Count - 1;
				if(Count == ArtiklKey)
				{
					Count += 1 * 1;
				}
				if(sSifraArtikla == Artikl.sifra_artikla )
				{
				 	Postoji = true;
				}
				if(sNazivArtikla == Artikl.naziv_artikla)
				{
					Postoji2 = true;
				}					
			})

			if(Postoji == true)
			{
				alert('Unesena sifra vec postoji');
				return false;
			}	
			if(Postoji2 == true)
			{
				alert('Uneseni artikl vec postoji');
				return false;
			}
			oDbStanje.once('value', function(sOdgovorPosluzitelja2)
			{
				sOdgovorPosluzitelja2.forEach(function(snapshot2)
				{
					var StanjeKey = snapshot2.key;
					var Stanje = snapshot2.val();
					array2.push(Stanje.sifra_artikla);
					Count2 = array2.length;
					Count2 += 1 * 1;
					Count2 = Count2 - 1;
					if(Count2 == StanjeKey)
					{
						Count2 += 1 * 1;
					}
				})
					oDbKorisnici.on('value', function(sOdgovorPosluzitelja3)
					{
						var Radnik = ""
						sOdgovorPosluzitelja3.forEach(function(snapshot3)
						{
							Korisnik = snapshot3.val();
							if(Korisnik.id == sKorisnik)
							{
								Radnik = Korisnik.korisnicko_ime;
							}
						})
								
						let StanjeRef = oDb.ref('stanje/'+Count2);
	 					StanjeRef.set({'tip_dokumenta': sTipDokumenta, 'datum_dokumenta': Datum, 'sifra_artikla': parseInt(sSifraArtikla),'naziv_artikla': sNazivArtikla, 'kolicina_ulaz': sKolicinaUlaz, 'iznos_ulaz': sKolicinaUlaz, 'kolicina_izlaz': sKolicinaIzlaz, 'iznos_izlaz': sIznosIzlaz,'pocetno_stanje': parseInt(sPocetnoStanje), 'radnik':Radnik});
						ObrisiRedoveArtikli();
						RefreshStanje();
					})
				let ArtiklRef = oDb.ref('artikli/'+Count);
				ArtiklRef.set({'naziv_artikla' : sNazivArtikla, 'sifra_artikla' : parseInt(sSifraArtikla),'cijena':parseFloat(sCijena), 'jmj': sJdm});
			})
		})
		ObrisiRedoveArtikli();
		RefreshStanje();
	}
	document.getElementById('inptSifraArtikla2').value = '';
  	document.getElementById('inptNazivArtikla2').value = '';
  	document.getElementById('inptjdm2').value = '';
  	document.getElementById('inptCijena2').value = '';
  	document.getElementById('inptPocetnoStanje2').value = '';
}

function ObrisiArtikl(ArtiklKey)
{	
	var ArtiklRef = oDb.ref('artikli/'+ArtiklKey);
	var SifraArtikla = 0;
	ArtiklRef.once('value', function(oOdgovorPosluzitelja)
	{ 	
		var oArtikl = oOdgovorPosluzitelja.val();
		var answer = window.confirm("Da li ste sigurni?");
		if(answer)
		{
			let ArtiklRef = oDb.ref('artikli/'+ArtiklKey);
			SifraArtikla = oArtikl.sifra_artikla;
    		ArtiklRef.remove();  		
		

			oDbStanje.on('value', function(sOdgovorPosluzitelja)
			{
				sOdgovorPosluzitelja.forEach(function(snapshot)
				{
					StanjeKey = snapshot.key;
					Stanje = snapshot.val();

					if(Stanje.sifra_artikla == SifraArtikla)
					{
						let StanjeRef = oDb.ref('stanje/'+StanjeKey);
						StanjeRef.remove();
					}
				}) 
			})
			ObrisiRedoveArtikli();
    		RefreshStanje(); 
    	}
	})	
};

function Search2() 
{

  var input = document.getElementById("search2");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("tablica-stanje");
  var trs = table.tBodies[0].getElementsByTagName("tr");

  for (var i = 0; i < trs.length; i++) 
  	{

    	var tds = trs[i].getElementsByTagName("td");

    	trs[i].style.display = "none";

    	for (var i2 = 0; i2 < tds.length; i2++) 
    	{

      		if (tds[i2].innerHTML.toUpperCase().indexOf(filter) > -1) 
      		{

        		trs[i].style.display = "";
        
        		continue;
		}	}
    }
}	

/***************************************************************************************************/
function RefreshTable() {
       $( "#tablica-izvjesce" ).load( "izvjesce_artikla.html #tablica-izvjesce" );
   }

function PrikaziTablicu()
{
	document.getElementById("tablica-izvjesce").style.visibility = "visible";
}

function SakrijTablicu()
{
		document.getElementById("tablica-izvjesce").style.visibility = "hidden";

}

function ObrisiRedoveIzvjesce()
{
	$('#tablica-izvjesce tbody tr').remove();
}

function ArtiklFunction()
{	
	var array = [];
	var sNazivArtikla = $('#odaberiArtikl').val();
	var tablicaIzvjesce = $("#tablica-izvjesce");
	var pocetnoStanje = 0;
	oDbStanje.once('value', function(sOdgovorPosluzitelja)
	{
		sOdgovorPosluzitelja.forEach(function(snapshot)
		{
			var StanjeKey = snapshot.key;
			var Stanje = snapshot.val();

			if(Stanje.naziv_artikla == sNazivArtikla)
			{
				if(Stanje.tip_dokumenta == "PS")
				{
					pocetnoStanje = Stanje.pocetno_stanje;
				}

				tablicaIzvjesce.find('tbody').append
											(
											'<tr>'+
												'<td>'+ Stanje.naziv_artikla+'</td>'+
												'<td>'+ pocetnoStanje+'</td>'+
												'<td>'+ Stanje.datum_dokumenta+'</td>'+
												'<td>'+ Stanje.tip_dokumenta+'</td>'+
												'<td>'+ Stanje.radnik+'</td>'+
												'<td>'+ Stanje.kolicina_ulaz+'</td>'+
												'<td>'+ Stanje.iznos_ulaz+'</td>'+
												'<td>'+ Stanje.kolicina_izlaz+'</td>'+
												'<td>'+ Stanje.iznos_izlaz+'</td>'+
												'<td>'+ '<button type="button" onclick="ObrisiStanje('+StanjeKey+')" class="btn btn-default btnObrisi"><span class="fas fa-trash-alt"/>' + '</button>' +'</td>' +
												'<td>'+ '<button type="button" onclick="ModalUredi('+StanjeKey+')" class="btn btn-default"><span class="fas fa-pencil-alt"/>' + '</button>' +'</td>' +
											'</tr>'
											)
			}											
		})
	});
}

function ObrisiStanje(StanjeKey)
{	
	let StanjeRef = oDb.ref('stanje/' + StanjeKey); 

	StanjeRef.once('value', function(oOdgovorPosluzitelja)
	{ 	
		var oStanje = oOdgovorPosluzitelja.val();
		if(oStanje.tip_dokumenta == "PS")
		{
			alert("Ovaj dokument se ne može izbrisati");
			return false;
		}
		var answer = window.confirm("Da li ste sigurni?");
		if(answer && (oStanje.tip_dokumenta == "IZD" || oStanje.tip_dokumenta == "PRM"))
		{
			let StanjeRef = oDb.ref('stanje/' + StanjeKey);
    		StanjeRef.remove();
    		ObrisiRedoveIzvjesce();
    		ArtiklFunction();
		}
		
	});
}

function ModalUredi(StanjeKey)
{	
	let StanjeRef = oDb.ref('stanje/' + StanjeKey); 

	StanjeRef.once('value', function(oOdgovorPosluzitelja)
	{
		var oStanje = oOdgovorPosluzitelja.val();
		if(oStanje.tip_dokumenta == "IZD")
		{
			// Popunjavanje elemenata forme za uređivanje
			$('#inptSifraArtikla2').val(oStanje.sifra_artikla);
			$('#inptKolicina2').val(oStanje.kolicina_izlaz);

			document.getElementById("inptSifraArtikla2").disabled = true;
			$('#btnUrediStanjeIzdatnica').attr('onclick', 
			'UrediStanje("'+StanjeKey+'")');

			// Prikaži modal
			$('#urediIzvjesceIzdatnica').modal('show');
		}
		else if (oStanje.tip_dokumenta == "PRM") 
		{
			// Popunjavanje elemenata forme za uređivanje
			$('#inptSifraArtikla').val(oStanje.sifra_artikla);
			$('#inptKolicina').val(oStanje.kolicina_ulaz);

			document.getElementById("inptSifraArtikla").disabled = true;
			$('#btnUrediStanjePrimka').attr('onclick', 
			'UrediStanje("'+StanjeKey+'")');

			// Prikaži modal
			$('#urediIzvjescePrimka').modal('show');
		}
		else if(oStanje.tip_dokumenta == "PS")
		{
			$('#inptSifraArtikla3').val(oStanje.sifra_artikla);
			$('#inptKolicina3').val(oStanje.pocetno_stanje);

			document.getElementById("inptSifraArtikla3").disabled = true;
			$('#btnUrediStanjePocetna').attr('onclick', 
			'UrediStanje("'+StanjeKey+'")');

			// Prikaži modal
			$('#urediIzvjescePocetna').modal('show');
		}
	})
}


function UrediStanje(StanjeKey)
{
	var StanjeRef = oDb.ref('stanje/'+StanjeKey);
	var Cijena = 0;
	var sUrl = window.location.href ;
	var oUrl = new URL(sUrl);
	var sKorisnik = oUrl.searchParams.get("korisnik_id");
	var sSifraArtikla = $('#inptSifraArtikla').val();
	var sSifraArtikla2 = $('#inptSifraArtikla2').val();
	var sSifraArtikla3 = $('#inptSifraArtikla3').val();
	document.getElementById("inptSifraArtikla").disabled = true;
	document.getElementById("inptSifraArtikla2").disabled = true;
	document.getElementById("inptSifraArtikla3").disabled = true;
	var Provjera = false;
	var answer = window.confirm("Da li ste sigurni?");
	oDbStanje.on('value', function(sOdgovorPosluzitelja2)
		{
			sOdgovorPosluzitelja2.forEach(function(snapshot)
			{
				Stanje = snapshot.val();
				if(Stanje.sifra_artikla != sSifraArtikla || Stanje.sifra_artikla == sSifraArtikla2 || Stanje.sifra_artikla == sSifraArtikla3 )
				{
					Provjera = true;
				}
			});

			if (Provjera == false) 
			{
				alert("Artikl pod unesenom šifrom ne postoji!");
				return false;
			}

			if(answer)
			{
			StanjeRef.once('value', function(sOdgovorPosluzitelja)
			{
			var sStanje = sOdgovorPosluzitelja.val();
			oDbArtikli.on('value', function(sOdgovorPosluzitelja3)
			{
				sOdgovorPosluzitelja3.forEach(function(snapshot3)
				{
					Artikl = snapshot3.val();
					if(Artikl.sifra_artikla == sSifraArtikla || Artikl.sifra_artikla == sSifraArtikla2 || Artikl.sifra_artikla == sSifraArtikla3)
					{
						Cijena = Artikl.cijena;
					}
				})
					oDbKorisnici.on('value', function(sOdgovorPosluzitelja3)
 			    	{
 			    		var Radnik = "";
 			    		sOdgovorPosluzitelja3.forEach(function(snapshot3)
 			    			{	
 			    				Korisnik = snapshot3.val();
 			    				if(Korisnik.id == sKorisnik)
 			    				{
 			    					Radnik = Korisnik.korisnicko_ime;
 			    				}
 			    			})
 			    		
							if (sStanje.tip_dokumenta == "IZD")
		    				{
		    					var sSifraArtikla = $('#inptSifraArtikla2').val();
								var Kolicina = $('#inptKolicina2').val();
			  					var oStanje = 	{
													'datum_dokumenta': sStanje.datum_dokumenta, 
													'kolicina_ulaz': 0, 
													'iznos_ulaz':0, 
													'kolicina_izlaz': parseInt(Kolicina), 
													'iznos_izlaz':Kolicina * Cijena,
													'naziv_artikla':sStanje.naziv_artikla,
													'sifra_artikla':parseInt(sSifraArtikla),
													'tip_dokumenta':sStanje.tip_dokumenta,
													'radnik': Radnik
												}
		        				StanjeRef.update(oStanje);
		   					}
		    				else if (sStanje.tip_dokumenta == "PRM")
		    				{
		    					var sSifraArtikla = $('#inptSifraArtikla').val();
								var Kolicina = $('#inptKolicina').val();
			   					var oStanje =   {
													'datum_dokumenta': sStanje.datum_dokumenta, 
													'kolicina_ulaz': parseInt(Kolicina), 
													'iznos_ulaz':Kolicina * Cijena, 
													'kolicina_izlaz': 0, 
													'iznos_izlaz': 0,
													'naziv_artikla':sStanje.naziv_artikla,
													'sifra_artikla':parseInt(sSifraArtikla),
													'tip_dokumenta':sStanje.tip_dokumenta,
													'radnik':Radnik
												}
		       					StanjeRef.update(oStanje);
		   					}
		   					else if (sStanje.tip_dokumenta == "PS")
		    				{
		    					var sSifraArtikla = $('#inptSifraArtikla3').val();
								var Kolicina = $('#inptKolicina3').val();
			   					var oStanje = 	{
													'datum_dokumenta': sStanje.datum_dokumenta, 
													'kolicina_ulaz': 0, 
													'iznos_ulaz':0, 
													'kolicina_izlaz': 0, 
													'iznos_izlaz': 0,
													'naziv_artikla':sStanje.naziv_artikla,
													'sifra_artikla':sSifraArtikla,
													'tip_dokumenta':sStanje.tip_dokumenta,
													'pocetno_stanje': Kolicina,
													'radnik':Radnik
												}
		       					StanjeRef.update(oStanje);
		   					}
					})
			})
			})
	ObrisiRedoveIzvjesce();
	ArtiklFunction();
	}
	else
	{
		return false;
	}
});
}

function Search() 
{

  var input = document.getElementById("search");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("tablica-izvjesce");
  var trs = table.tBodies[0].getElementsByTagName("tr");

  // prolazak kroz redove
  for (var i = 0; i < trs.length; i++) 
  	{

    	// definiranje celija reda
    	var tds = trs[i].getElementsByTagName("td");

    	// sakrij red
    	trs[i].style.display = "none";

   		 // prolazak kroz celije reda
    	for (var i2 = 0; i2 < tds.length; i2++) 
    	{

      		// ako ima podudaranja
     		 if (tds[i2].innerHTML.toUpperCase().indexOf(filter) > -1) 
      			{

       				 // pokazi red
       				 trs[i].style.display = "";

        			// sljedeci red
       				 continue;
     			}
        }
    }
}


function DodajOpciju()
{
	var select = document.getElementById("odaberiArtikl"); 
	oDbArtikli.on('value', function(sOdgovorPosluzitelja)
	{
		sOdgovorPosluzitelja.forEach(function(snapshot)
		{
			var Artikl =snapshot.val();
			var opt = Artikl.naziv_artikla;

			var el = document.createElement("option");
			el.text =opt;
			el.value = opt;

			select.add(el);
		})
	});
}

function convertDate(d) 
{
  	var p = d.split(".");
  	return +(p[2]+p[1]+p[0]);
}

function sortByDate() 
{
  	var tbody = document.querySelector("#tablica-izvjesce tbody");
  	var rows = [].slice.call(tbody.querySelectorAll("tr"));
  
  	rows.sort(function(a,b) 
  	{
    	return convertDate(a.cells[2].innerHTML) - convertDate(b.cells[2].innerHTML);
  	});
  
  	rows.forEach(function(v) 
 	{
    	tbody.appendChild(v); // .appendChild pomice element
  	});
}

function createPDF() {
        var sTable = document.getElementById('tablica-container').innerHTML;

        var style = "<style>";
        style = style + "table {width: 100%;font: 17px Calibri;}";
        style = style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
        style = style + "padding: 2px 3px;text-align: center;}";
        style = style + "</style>";

        // kreira window objekt
        var win = window.open('', '', 'height=700,width=700');

        win.document.write('<html><head>');
        win.document.write('<title>Profile</title>');   
        win.document.write(style);          
        win.document.write('</head>');
        win.document.write('<body>');
        win.document.write(sTable);      
        win.document.write('</body></html>');

        win.document.close(); 	// zatvara trenutni prozor

        win.print();    // ispis sadržaja
    }

/*************************************************************************************************/
function ModalDodajIzdatnicu()
{	
		// Prikaži modal
		$('#dodajIzdatnicu').modal('show');

		// Dodavanje događaja na gumb Ažuriraj
		$('#btnDodajIzdatnicu').attr('onclick',
		'DodajIzdatnicu()');
}

function DodajIzdatnicu()
{
	var Provjera = false;
	var sUrl = window.location.href ;
	var oUrl = new URL(sUrl);
	var sKorisnik = oUrl.searchParams.get("korisnik_id");
	var sSifraArtikla = $('#inptSifraArtikla').val();
	var sKolicinaIzlaz = $('#inptKolicinaIzlaz').val();
	var answer = window.confirm("Da li ste sigurni?");
	if(sSifraArtikla == "" || sKolicinaIzlaz == "")
	{
		alert("Nisu popunjena sva polja!");
	}
	else if(answer)
	{
		var sTipDokumenta = 'IZD';
		var sKolicinaUlaz = 0;
		var sIznosUlaz = 0;
		var sNazivArtikla = "";
		var Datum = DajDatum();
		var Cijena = 0;
		var Count = 0;
		var array =[];
		var Granica = 0;
		var Granica2 = 0;
		var PocetnoStanje = 0;
		oDbArtikli.on('value', function(sOdgovorPosluzitelja)
		{
			sOdgovorPosluzitelja.forEach(function(snapshot)
			{
				var ArtiklKey = snapshot.key;
				var Artikl = snapshot.val();
				if(sSifraArtikla == Artikl.sifra_artikla)
				{
					Provjera = true;
					oDbStanje.once('value', function(sOdgovorPosluzitelja2)
		    		{
			    		sOdgovorPosluzitelja2.forEach(function(snapshot2)
			    		{
				    		var StanjeKey = snapshot2.key;
			        		var Stanje = snapshot2.val();
				    		array.push(Stanje.sifra_artikla);
				    		Count = array.length;
							Count += 1 * 1 ;
							Count = Count - 1;
							if(Count == StanjeKey)
							{
								Count += 1 * 1;
							}
							if(Stanje.sifra_artikla == sSifraArtikla)
							{
								if(Stanje.tip_dokumenta == "PS")
							{
								PocetnoStanje = Stanje.pocetno_stanje;
							}
								Granica += Stanje.kolicina_ulaz * 1;
								Granica2 += Stanje.kolicina_izlaz * 1;

							}
 			    		})
 			    		oDbKorisnici.on('value', function(sOdgovorPosluzitelja3)
 			    		{
 			    			var Radnik = "";
 			    			sOdgovorPosluzitelja3.forEach(function(snapshot3)
 			    			{	
 			    				Korisnik = snapshot3.val();
 			    				if(Korisnik.id == sKorisnik)
 			    					{
 			    						Radnik = Korisnik.korisnicko_ime;
 			    					}
 			    			})
 			    		
 			    		console.log(Granica);
 			    		console.log(PocetnoStanje);
			    		var Suma = (Granica + PocetnoStanje) - Granica2;
			    		console.log(Suma);
 			    		if(Suma < sKolicinaIzlaz)
 			    		{
 			    			alert('Nema dovoljno sredstava na skladištu');
 			    			return false;
 			    		}
							sNazivArtikla = Artikl.naziv_artikla;
							Cijena = Artikl.cijena;
			
							let userRef = oDb.ref('stanje/'+Count);
 							userRef.set({'tip_dokumenta': sTipDokumenta, 'datum_dokumenta': Datum, 'sifra_artikla': parseInt(sSifraArtikla),'naziv_artikla': sNazivArtikla,'radnik': Radnik,'kolicina_ulaz': parseInt(sKolicinaUlaz), 'iznos_ulaz': parseInt(sIznosUlaz), 'kolicina_izlaz': parseInt(sKolicinaIzlaz), 'iznos_izlaz': sKolicinaIzlaz * Cijena});
			        	})
			        });
		        }									
	        })
	        if(Provjera == false)
  			{
  				alert("Uneseni artikl ne postoji");
  				return false;
  			}
	    });
  	}
  	document.getElementById('inptSifraArtikla').value = '';
  	document.getElementById('inptKolicinaIzlaz').value = '';
}
/*****************************************************************************************************/

function ModalDodajPrimku()
{	
		// Prikaži modal
		$('#dodajPrimku').modal('show');

		// Dodavanje događaja na gumb Ažuriraj
		$('#btnDodajPrimku').attr('onclick',
		'DodajPrimku()');
}

function DodajPrimku()
{
	var Provjera = false;
	var sUrl = window.location.href ;
	var oUrl = new URL(sUrl);
	var sKorisnik = oUrl.searchParams.get("korisnik_id");
	var sSifraArtikla = $('#inptSifraArtikla').val();
	var sKolicinaUlaz = $('#inptKolicinaUlaz').val();
	console.log(sKolicinaUlaz);
	var array =[];
	var answer = window.confirm("Da li ste sigurni?");
	if(sSifraArtikla == "" || sKolicinaUlaz == "" )
	{
		alert("Nisu popunjena sva polja!");
	}
	else if(answer)
	{
		var sTipDokumenta = 'PRM';
		var sKolicinaIzlaz = 0;
		var sIznosIzlaz = 0;
		var Datum = DajDatum();
		var Cijena = 0;
		var Count = 0;
		var array = [];
	
		oDbArtikli.on('value', function(sOdgovorPosluzitelja)
		{
			sOdgovorPosluzitelja.forEach(function(snapshot)
			{
				var ArtiklKey = snapshot.key;
				var Artikl = snapshot.val();
				if(Artikl.sifra_artikla == sSifraArtikla)
				{	
					Provjera = true;
					oDbStanje.once('value', function(sOdgovorPosluzitelja2)
					{
						sOdgovorPosluzitelja2.forEach(function(snapshot2)
						{
							var StanjeKey = snapshot2.key;
			        		var Stanje = snapshot2.val();
				    		array.push(Stanje.sifra_artikla);
				    		Count = array.length;
							Count += 1 * 1 ;
							Count = Count - 1;
							if(Count == StanjeKey)
							{
								Count += 1 * 1;
							}
 						})
 						oDbKorisnici.on('value', function(sOdgovorPosluzitelja3)
 			    		{
 			    			var Radnik = "";
 			    			sOdgovorPosluzitelja3.forEach(function(snapshot3)
 			    			{	
 			    				Korisnik = snapshot3.val();
 			    				if(Korisnik.id == sKorisnik)
 			    					{
 			    						Radnik = Korisnik.korisnicko_ime;
 			    					}
 			    			})
						sNazivArtikla = Artikl.naziv_artikla;
						Cijena = Artikl.cijena;
						let userRef = oDb.ref('stanje/'+Count);
 						userRef.set({'tip_dokumenta': sTipDokumenta, 'datum_dokumenta': Datum, 'sifra_artikla': parseInt(sSifraArtikla),'naziv_artikla': sNazivArtikla,'radnik': Radnik, 'kolicina_ulaz': parseInt(sKolicinaUlaz), 'iznos_ulaz': parseInt(sKolicinaUlaz * Cijena), 'kolicina_izlaz': parseInt(sKolicinaIzlaz), 'iznos_izlaz': parseInt(sIznosIzlaz)});
						})
					});
				}								
			})

			if(Provjera == false)
  			{
  				alert("Uneseni artikl ne postoji");
  				return false;
  			}
		});
	}
	document.getElementById('inptSifraArtikla').value = '';
  	document.getElementById('inptKolicinaUlaz').value = '';		
}

/**************************************************************/


$("#btnIzadi").click(function()
{
            $("#dodajArtikl").modal('hide');
        })
$("#btnIzadi2").click(function()
{
            $("#urediArtikl").modal('hide');
        })
$("#btnIzadiPrimka").click(function()
{
            $("#urediIzvjescePrimka").modal('hide');
        })

$("#btnIzadiIzdatnica").click(function()
{
            $("#urediIzvjesceIzdatnica").modal('hide');
        })
$("#btnIzadiPocetna").click(function()
{
            $("#urediIzvjescePocetna").modal('hide');
        })
$("#btnIzadiDodajIzdatnicu").click(function()
{
            $("#dodajIzdatnicu").modal('hide');
        })
$("#btnIzadiDodajPrimku").click(function()
{
            $("#dodajPrimku").modal('hide');
        })


function Prijava()
{
	var prijava = false;
	var KorisnickoIme = $('#inptKorisnik').val();
	var Lozinka = $('#inptLozinka').val();
	KorisnickoIme2 = $('#inptKorisnik').val();
	oDbKorisnici.once('value', function(sOdgovorPosluzitelja)
	{
		sOdgovorPosluzitelja.forEach(function(snapshot)
		{
			var Korisnik = snapshot.val();
			var KorisinikKey = snapshot.key;

			if(KorisnickoIme == Korisnik.korisnicko_ime && Lozinka == Korisnik.lozinka)
			{
				var url = "pocetno_stanje.html?korisnik_id="+encodeURIComponent(Korisnik.id);
				window.location.href = url;
				prijava = true;
				console.log(KorisnickoIme);
			}
		})
		if(prijava == false)
		{
		alert("Neispravno");
		}
	});
}

var sUrl = window.location.href ;
var oUrl = new URL(sUrl);
var sKorisnik = oUrl.searchParams.get("korisnik_id");

function UcitajUrlIzvjesce()
{

	var url = "izvjesce_artikla.html?korisnik_id="+encodeURIComponent(sKorisnik);
	window.location.href = url;

}
function UcitajUrlIzdatnice()
{

	var url = "kreiranje_izdatnice.html?korisnik_id="+encodeURIComponent(sKorisnik);
	window.location.href = url;
}
function UcitajUrlPrimke()
{

	console.log(sKorisnik);
	var url = "kreiranje_primke.html?korisnik_id="+encodeURIComponent(sKorisnik);
	window.location.href = url;
}
function UcitajPocetnu()
{
	console.log(sKorisnik);
	var url = "pocetno_stanje.html?korisnik_id="+encodeURIComponent(sKorisnik);
	window.location.href = url;
}

function Odjava()
{
	var url = "login.html";
	window.location.href = url;
}

	
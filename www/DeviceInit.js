/// <reference path="Z:\SimoVinci_HOME\Documenti\Development\DotNET\TP_App\TP_App\Scripts/jquery-1.10.2.min.js" />

/** Istanza di PushManager */
var pushManager;

/** Istanza di TP_MobileEngine */
var tp;


/** Si occupa delle configurazioni e delle inizializzazioni da fare appena avviato il device */
function DeviceInitializator() {
  

  var gapReady;
  var jqmReady;

  var tpID;
  var domain;

  try {
    gapReady = $.Deferred();
    jqmReady = $.Deferred();
  } catch (e) {
    /*
    In caso di connessione assente non ho jQuery e queste assegnazioni possono andare in errore.
    Il caso di connessione mancata viene gestito all'interno dell'onDeviceReady più avanti.
    */
  }


  function tokenHandler(result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    var reg = window.localStorage.getItem("Registered");
    if (reg != result)
      pushManager.sendRegID(result, device.platform);
  }

  function successHandler(result) {

  }

  function errorHandler(error) {
    //$("#app-status-ul").append('<li>error:'+ error +'</li>');
    //alert("errore");
    console.log(error);
  }

  function getTpID() {
    /** Controllo l'id del TP tradotto nella memoria local **/
    window.localStorage.setItem("TpId", $(document.body).data("tp"));
    if (window.localStorage.getItem("idLingua") != null) {
      if (window.localStorage.getItem("idLingua") != window.localStorage.getItem("TpId")) {
        return window.localStorage.getItem("idLingua");
      }
      else {
        return window.localStorage.getItem("TpId");
      }
    }
    else {
      return window.localStorage.getItem("TpId");
    }
  }


  function getDomain() {
    if ($(document.body).data("db") == "prod")
      return "http://mobile.wm4pr.com";
    else if ($(document.body).data("db") == "test")
      return "http://mobiletest.wm4pr.com";
    else // debugging da localhost
      return "";
  }

  /**
  * Se ci troviamo sul device verifica la connettività,
  * in caso negativo redirige alla pagina di cortesia
  */
  function checkConnection() {
    if (typeof onDevice !== 'undefined') {

      // se lo script cordova.js e' incluso
      if (typeof Connection !== 'undefined') {
        if (navigator.connection.type == Connection.NONE)
          location.href = "no_connection.html";
      }

      //var states = {};
      //states[Connection.UNKNOWN] = 'Unknown connection';
      //states[Connection.ETHERNET] = 'Ethernet connection';
      //states[Connection.WIFI] = 'WiFi connection';
      //states[Connection.CELL_2G] = 'Cell 2G connection';
      //states[Connection.CELL_3G] = 'Cell 3G connection';
      //states[Connection.CELL_4G] = 'Cell 4G connection';
      //states[Connection.CELL] = 'Cell generic connection';
      //states[Connection.NONE] = 'No network connection';
    }
	
	//Plugin per clear cache
	var success = function(status) {
            console.log('Message: ' + status);
        }

	var error = function(status) {
            console.log('Error: ' + status);
        }

	window.cache.clear( success, error );
	
  }


  // se nn siamo sul telefono risolvo l'evento gapReady
  if (typeof onDevice === 'undefined')
    gapReady.resolve();

  document.addEventListener("deviceReady", function () {
    checkConnection();  // se non ho la connessione fallback
    gapReady.resolve();
  }, false);


  $(document).one("mobileinit", function () {
    //***** PRE-SETTINGS di JQM
    //Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;  // necessario per il funzionamento di PhoneGap
    $.mobile.allowCrossDomainPages = true;  // necessario per il funzionamento di PhoneGap
    $.mobile.pushStateEnabled = false;  // raccomandato da jquery mobile (uso con PhoneGAP)
    // *******

    $(function () {
      tpID = getTpID();
      domain = getDomain();
      jqmReady.resolve();
    });
  });

  // deviceReady deve venire prima di mobileInit (da docs)
  $.when(gapReady, jqmReady).then(function () {

    if (typeof onDevice !== 'undefined') {
      pushManager = new PushManager(tpID, domain);
      var appID = pushManager.getAppID(tpID);
      pushNotification = window.plugins.pushNotification;
      if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos')
        pushNotification.register(successHandler, errorHandler, { "senderID": appID, "ecb": "pushManager.onNotification" });		// required!
      else
        pushNotification.register(tokenHandler, errorHandler, { "badge": "true", "sound": "true", "alert": "true", "ecb": "pushManager.onNotificationAPN" });	// required!
    }

    /** Istanza di TP_MobileEngine */
    tp = new TP_MobileEngine();

  }).fail(function () {
    console.log("Qualcosa non va codroipo ornando campa");
  });
}



(function () {
  var devInit = new DeviceInitializator();
}());
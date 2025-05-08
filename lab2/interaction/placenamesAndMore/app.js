var allFunctions = function () {
  "use strict";

  console.log("entering all functions");
  var createTableFromJsonResponse = function (data) {
    document.querySelector("main .forDebug").append(JSON.stringify(data));

    if (
      typeof data.postalcodes !== "undefined" &&
      data.postalcodes.length > 0
    ) {
      data.postalcodes.forEach(function (item) {
        var row = document.createElement("tr");
        row.style.display = "none";
        row.innerHTML =
          '<td data-col="placeName">' +
          item.placeName +
          "</td>" +
          '<td data-col="latitude">' +
          item.lat +
          "</td>" +
          '<td data-col="longitude">' +
          item.lng +
          "</td>" +
          '<td><input type="button" class="theButton1" value="Get WMS map"></td>' +
          '<td><input type="button" class="theButton2" value="Find nearest Intersection"></td>';
        document.querySelector("#resultsTable").append(row);
        row.style.display = "table-row";
      });
    } else {
      document.querySelector("main .messages").append("no results found");
    }
  };

  var getPlacenames_plain_javascript = function (
    postalcodeInput,
    countryInput
  ) {
    var baseUrl =
      "http://api.geonames.org/postalCodeLookupJSON?username=bktudelft";
    var params = "&postalcode=" + postalcodeInput + "&country=" + countryInput;
    var requestUrl = baseUrl + params;

    fetch(requestUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        createTableFromJsonResponse(data);
      })
      .catch(function () {
        document.querySelector("main .messages").append("connection error");
      });
  };

  var searchFromInput = function () {
    var postalcodeInput;
    var countryInput;

    if (document.querySelector("section#geonames input").value !== "") {
      postalcodeInput = document.querySelector("#postal").value;
      countryInput = document.querySelector("#countrySelect").value;

      var rows = document.querySelectorAll("#resultsTable tr");
      for (var i = 1; i < rows.length; i++) {
        rows[i].remove();
      }

      document.querySelector("main .messages").innerHTML = "";
      document.querySelector("main .forDebug").innerHTML = "";

      getPlacenames_plain_javascript(postalcodeInput, countryInput);
    } else {
      alert("Enter (first part of) postal code");
    }
  };

  document
    .querySelector("section#geonames button")
    .addEventListener("click", function (event) {
      searchFromInput();
    });

  document
    .querySelector("section#geonames input")
    .addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        searchFromInput();
      }
    });

  var anotherGeonamesRequest = function (latitude, longitude) {
    var baseUrl =
      "http://api.geonames.org/findNearestIntersectionOSM?username=bktudelft";
    var params = "&lat=" + latitude + "&lng=" + longitude;
    var requestUrl = baseUrl + params;
    var request = new XMLHttpRequest();
    request.open("GET", requestUrl, true);
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        document.querySelector("main .forDebug2").textContent = "";
        document.querySelector("#xmlDataAsTable").innerHTML = "";
        var textarea = document.createElement("textarea");
        textarea.rows = "20";
        textarea.cols = "60";
        textarea.style.border = "solid 1px black";
        textarea.textContent = this.responseText;
        document.querySelector("main .forDebug2").append(textarea);
        var xmlData = this.responseXML;
        handleXMLResponse(xmlData);
      } else {
        document
          .querySelector("main .messages")
          .append("target server reached but unknown error");
      }
    };
    request.onerror = function () {
      document.querySelector("main .messages").append("connection error");
    };

    request.send();
  };

  var handleXMLResponse = function (data) {
    var feature = data.getElementsByTagName("intersection")[0];
    if (typeof feature !== "undefined" && feature.childNodes.length > 0) {
      var headerRow = document.createElement("tr");
      headerRow.innerHTML = "<th>Property name</th><th>value</th>";
      document.querySelector("#xmlDataAsTable").append(headerRow);
      for (var i = 0; i < feature.childNodes.length; i++) {
        if (feature.childNodes[i].nodeName != "#text") {
          var row = document.createElement("tr");
          row.style.display = "none";
          row.innerHTML =
            "<td>" +
            feature.childNodes[i].nodeName +
            "</td>" +
            "<td>" +
            feature.childNodes[i].childNodes[0].nodeValue +
            "</td>";
          document.querySelector("#xmlDataAsTable").append(row);
          row.style.display = "table-row";
        }
      }
    } else {
      document
        .querySelector("main .messages2")
        .append("no 'intersection' in XML response");
    }
  };

  var getAndDisplayMap = function (wms_request) {
    document.querySelector("main .mapDiv").innerHTML = "";
    var img = document.createElement("img");
    img.style.display = "none";
    img.src = wms_request;
    document.querySelector("main .mapDiv").append(img);
    img.style.display = "block";
  };

  var constructWMSrequest = function (
    baseUrl,
    layers,
    styles,
    leftX,
    lowerY,
    rightX,
    upperY,
    width_wms,
    height_wms
  ) {
    var basepart =
      baseUrl +
      "SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true";

    var wms_request =
      basepart +
      "&STYLES=" +
      styles +
      "&LAYERS=" +
      layers +
      "&SRS=EPSG:4326&WIDTH=" +
      width_wms +
      "&HEIGHT=" +
      height_wms;
    wms_request +=
      "&BBOX=" + leftX + "," + lowerY + "," + rightX + "," + upperY;

    return wms_request;
  };

  var requestWMSmap = function (latitude, longitude) {
    var width_wms = 512;
    var height_wms = 512;
    var centerX = parseFloat(longitude);
    var centerY = parseFloat(latitude);

    var leftX = centerX - 0.005;
    var lowerY = centerY - 0.005;
    var rightX = centerX + 0.005;
    var upperY = centerY + 0.005;
    var baseUrl = "http://ows.terrestris.de/osm/service?";
    var layers = "OSM-WMS";
    var styles = "";
    var wms_request = constructWMSrequest(
      baseUrl,
      layers,
      styles,
      leftX,
      lowerY,
      rightX,
      upperY,
      width_wms,
      height_wms
    );
    getAndDisplayMap(wms_request);
  };

  var searchFromInput = function () {
    var postalcodeInput;
    var countryInput;

    if (document.querySelector("section#geonames input").value !== "") {
      postalcodeInput = document.querySelector("#postal").value;
      countryInput = document.querySelector("#countrySelect").value;
      var rows = document.querySelectorAll("#resultsTable tr");
      for (var i = 1; i < rows.length; i++) {
        rows[i].remove();
      }
      document.querySelector("main .messages").textContent = "";
      document.querySelector("main .forDebug").textContent = "";

      getPlacenames_plain_javascript(postalcodeInput, countryInput);
    } else {
      alert("Enter (first part of) postal code");
    }
  };

  document.body.addEventListener("click", function (event) {
    if (event.target.matches("input.theButton2")) {
      console.log("a button2 clicked");
      var lat, lng;
      var children = event.target.parentNode.parentNode.children;
      for (var i = 0; i < children.length; i++) {
        let elem = children[i];
        if (elem.matches("td[data-col='latitude']")) {
          lat = elem.textContent;
          break;
        }
      }
      children = event.target.parentNode.parentNode.children;
      for (var i = 0; i < children.length; i++) {
        let elem = children[i];
        if (elem.matches("td[data-col='longitude']")) {
          lng = elem.textContent;
          break;
        }
      }
      anotherGeonamesRequest(lat, lng);
    }

    if (event.target.matches("input.theButton1")) {
      console.log("a button with class theButton1 clicked");
      var lat, lng;
      var children = event.target.parentNode.parentNode.children;
      for (var i = 0; i < children.length; i++) {
        let elem = children[i];
        if (elem.matches("td[data-col='latitude']")) {
          lat = elem.textContent;
          break;
        }
      }
      children = event.target.parentNode.parentNode.children;
      for (var i = 0; i < children.length; i++) {
        let elem = children[i];
        if (elem.matches("td[data-col='longitude']")) {
          lng = elem.textContent;
          break;
        }
      }
      requestWMSmap(lat, lng);
    }
  });
<<<<<<< HEAD
};

=======
}
>>>>>>> efa30b157dec2d1ea3a0d1848d75e18240cf7b7f
document.addEventListener("DOMContentLoaded", allFunctions);

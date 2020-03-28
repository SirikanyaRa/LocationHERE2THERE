
    function toggleRequestPanel() {
      if (document.getElementById('partialRequestPanel').style.display === 'none') {
        document.getElementById('partialRequestPanel').style.display = 'block';
        document.getElementById('freeformRequestPanel').style.display = 'none';
      } else {
        document.getElementById('partialRequestPanel').style.display = 'none';
        document.getElementById('freeformRequestPanel').style.display = 'block';
      }
    }

    var searchText;
    function getFreeformInput() {
      searchText = document.getElementById('freeformInput').value;
    }

    function freeformInput() {
      if (document.getElementById('freeformInput').value == '') {
        alert('Cannot leave free-form input as blank');
      } else {
        getFreeformInput();
        geocode(platform);
        searchPlaces(platform);
        document.getElementById('resultPanel').style.display = 'block';
        document.getElementById('freeformInputPanel').style.display = 'block';
        document.getElementById('geocodeResultPanel').style.display = 'block';
        document.getElementById('placesResultPanel').style.display = 'block';
        document.getElementById('freeformInputDisplay').innerHTML = document.getElementById('freeformInput').value;
      }
    }

    var houseNumber, street, district, city, postalCode, county;
    function getPartialInput() {
      houseNumber = document.getElementById('houseNumber').value;
      street = document.getElementById('street').value;
      district = document.getElementById('district').value;
      city = document.getElementById('city').value;
      postalCode = document.getElementById('postalCode').value;
      county = document.getElementById('county').value;
    }

    function partialInput() {
      getPartialInput();
      partialGeocode(platform);
      document.getElementById('resultPanel').style.display = 'block';
      document.getElementById('freeformInputPanel').style.display = 'none';
      document.getElementById('geocodeResultPanel').style.display = 'block';
      document.getElementById('placesResultPanel').style.display = 'none';
    }

    function clearPanel() {
      var geocodeResult = document.getElementById('geocodeResult');
      while (geocodeResult.firstChild) {
        geocodeResult.removeChild(geocodeResult.firstChild);
      }
      var placesResult = document.getElementById('placesResult');
      while (placesResult.firstChild) {
        placesResult.removeChild(placesResult.firstChild);
      }
    }

    function removeMarker() {
      groupGeocode.removeAll();
      groupPlaces.removeAll();
    }

    // Geocoder API - freeform input
    function geocode(platform) {
      var geocoder = platform.getGeocodingService(),
        geocodingParameters = {
          jsonattributes: 1,
          gen: 9,
          country: '',
          searchText: searchText
        };
      geocoder.geocode(geocodingParameters, onGeocodeSuccess, onGeocodeError);
    }

    function onGeocodeSuccess(result) {
      // console.log(result);
      if (result.response.view == 0) {
        document.getElementById('geocodeResult').innerHTML = 'No result returned, please try geocode using partial address information.';
      } else {
        var locations = result.response.view[0].result;
        addGeocodeToMap(locations);
        addGeocodeToPanel(locations);
      }
    }

    function onGeocodeError(error) {
      alert('Ooops!');
    }

    // Geocoder API - partial address input
    function partialGeocode(platform) {
      var geocoder = platform.getGeocodingService(),
        geocodingParameters = {
          jsonattributes: 1,
          gen: 9,
          country: '',
          houseNumber: houseNumber,
          street: street,
          district: district,
          city: city,
          postalCode: postalCode,
          county: county
        };
      geocoder.geocode(geocodingParameters, onPartialGeocodeSuccess, onPartialGeocodeError);
    }

    function onPartialGeocodeSuccess(result) {
      // console.log(result);
      if (result.response.view == 0) {
        document.getElementById('geocodeResult').innerHTML = 'No result returned.';
      } else {
        var locations = result.response.view[0].result;
        addGeocodeToMap(locations);
        addGeocodeToPanel(locations);
      }
    }

    function onPartialGeocodeError(error) {
      alert('Ooops!');
    }

    // Places API
    function searchPlaces(platform) {
      var search = new H.places.Search(platform.getPlacesService());
      var params = {
        'Accept-Language': 'en-EN,en;q=0.9',
        'tf': 'plain',
        'at': '14.58865,120.98454',
        'countryCode': 'PHL',
        'q': searchText
      };
      search.request(params, {}, onPlacesResult, onPlacesError);
    }

    function onPlacesResult(result) {
      var places = result.results.items;
      // console.log(result);
      if (result.results.items == 0) {
        document.getElementById('placesResult').innerHTML = 'No result returned, please try to clean up your input.';
      } else {
        var locations = result.results.items;
        addPlacesToMap(places);
        addPlacesToPanel(places);
      }
    }

    function onPlacesError(error) {
      alert('Ooops!');
    }

    // Add result to panel
    function addGeocodeToPanel(locations) {
      var nodeOL = document.createElement('ol');
      for (var i = 0; i < locations.length; i += 1) {
        var li = document.createElement('li');
        var divLabel = document.createElement('div');
        var address = locations[i].location.address;
        var position = {
          lat: locations[i].location.displayPosition.latitude,
          lng: locations[i].location.displayPosition.longitude
        };
        var content = '<b><a href="#" onclick="map.setCenter({lat:' + position.lat + ', lng:' + position.lng + '});map.setZoom(18)">' + address.label + '</a></b></br>';
        content += '<b>Match Level: </b>' + locations[i].matchLevel + '<br>';
        content += '<b>House Number: </b>' + address.houseNumber + '<br>';
        content += '<b>Street: </b>' + address.street + '<br>';
        content += '<b>District: </b>' + address.district + '<br>';
        content += '<b>City: </b>' + address.city + '<br>';
        content += '<b>Postal Code: </b>' + address.postalCode + '<br>';
        content += '<b>County: </b>' + address.county + '<br>';
        content += '<b>Country: </b>' + address.country + '<br>';
        content += '<b>Coordinates: </b>' + position.lat + ',' + position.lng;
        divLabel.innerHTML = content;
        li.appendChild(divLabel);
        nodeOL.appendChild(li);
      }
      geocodeContainer.appendChild(nodeOL);
    }
    var geocodeContainer = document.getElementById('geocodeResult');

    function addPlacesToPanel(places) {
      var nodeOL = document.createElement('ol');
      for (var i = 0; i < places.length; i += 1) {
        var li = document.createElement('li');
        var divLabel = document.createElement('div');
        var content = '<b><a href="#" onclick="map.setCenter({lat:' + places[i].position[0] + ', lng:' + places[i].position[1] + '});map.setZoom(18)">' + places[i].title + '</a></b></br>';
        content += '<b>Category: </b>' + places[i].category.title + '<br>';
        content += '<b>Vicinity: </b>' + places[i].vicinity + '<br>';
        content += '<b>Coordinates: </b>' + places[i].position[0] + ',' + places[i].position[1];
        divLabel.innerHTML = content;
        li.appendChild(divLabel);
        nodeOL.appendChild(li);
      }
      placesContainer.appendChild(nodeOL);
    }
    var placesContainer = document.getElementById('placesResult');

    /**
     * Boilerplate map initialization code starts below:
     */

    //Step 1: initialize communication with the platform
    var platform = new H.service.Platform({
      app_id: APPLICATION_ID,
      app_code: APPLICATION_CODE,
      useCIT: true,
      useHTTPS: true
    });
    var defaultLayers = platform.createDefaultLayers();

    //Step 2: initialize a map - this map is centered
    var map = new H.Map(document.getElementById('map'),
      defaultLayers.normal.map, {
        center: { lat:4.140634, lng:109.6181485 },  
        zoom: 5
      });

    //Step 3: make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Create the default UI components
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    // Now use the map as required...

    // Add marker and bubble info to map
    var bubble;
    function openBubble(position, text) {
      if (!bubble) {
        bubble = new H.ui.InfoBubble(position, { content: text });
        ui.addBubble(bubble);
      } else {
        bubble.setPosition(position);
        bubble.setContent(text);
        bubble.open();
      }
    }

    var groupGeocode = new H.map.Group();
    function addGeocodeToMap(locations) {
      var position;
      for (var i = 0; i < locations.length; i += 1) {
        position = {
          lat: locations[i].location.displayPosition.latitude,
          lng: locations[i].location.displayPosition.longitude
        };
        var tspanX;
        if (i >= 9) {
          tspanX = 8;
        } else {
          tspanX = 12;
        }
        var blueIconSvg = '<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="32" width="32" version="1.1" y="0px" x="0px" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" viewBox="0 0 32 32"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><path style="fill:#1162bc" class="path1" d="m16 1c2.8139 0 5.6279 1.3889 7.6744 3.6111 2.047 2.5 3.326 5.2778 3.326 8.6109 0 3.3333-1.2791 6.9444-3.3256 9.1667l-7.674 8.611-7.6744-8.611c-2.0465-2.222-3.3256-5.556-3.3256-9.167 0-3.3331 1.0233-6.1109 3.3256-8.6109 2.0464-2.2222 4.8604-3.6111 7.6744-3.6111z"/><text style="font-size:15px;letter-spacing:0px;line-height:100%;word-spacing:0px;font-family:&apos;MS Sans Serif&apos;;fill:#ffffff" xml:space="preserve" y="18" x="12"><tspan x="' + tspanX + '" y="18">' + (i + 1) + '</tspan></text></svg>';
        var blueIcon = new H.map.Icon(blueIconSvg);
        var geocodeMarker = new H.map.Marker(position, { icon: blueIcon });
        geocodeMarker.label = '<div style="font-family: MS Sans Serif; color: white; font-size: 14px"><b>Geocode</b><br>' + locations[i].location.address.label + '<br>(' + locations[i].matchLevel + ')</div>';
        groupGeocode.addObject(geocodeMarker);
      }
      groupGeocode.addEventListener('tap', function (evt) {
        map.setCenter(evt.target.getPosition());
        openBubble(evt.target.getPosition(), evt.target.label);
      }, false);
      map.addObject(groupGeocode);
      map.setViewBounds(groupGeocode.getBounds());
    }

    var groupPlaces = new H.map.Group();
    function addPlacesToMap(places) {
      var position;
      for (var i = 0; i < places.length; i += 1) {
        position = {
          lat: places[i].position[0],
          lng: places[i].position[1]
        };
        var tspanX;
        if (i >= 9) {
          tspanX = 8;
        } else {
          tspanX = 12;
        }
        var greenIconSvg = '<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="32" width="32" version="1.1" y="0px" x="0px" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" viewBox="0 0 32 32"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><path style="fill:#2ce28c" class="path1" d="m16 1c2.8139 0 5.6279 1.3889 7.6744 3.6111 2.047 2.5 3.326 5.2778 3.326 8.6109 0 3.3333-1.2791 6.9444-3.3256 9.1667l-7.674 8.611-7.6744-8.611c-2.0465-2.222-3.3256-5.556-3.3256-9.167 0-3.3331 1.0233-6.1109 3.3256-8.6109 2.0464-2.2222 4.8604-3.6111 7.6744-3.6111z"/><text style="font-size:15px;letter-spacing:0px;line-height:100%;word-spacing:0px;font-family:&apos;MS Sans Serif&apos;;fill:#ffffff" xml:space="preserve" y="18" x="12"><tspan x="' + tspanX + '" y="18">' + (i + 1) + '</tspan></text></svg>';
        var greenIcon = new H.map.Icon(greenIconSvg);
        var placesMarker = new H.map.Marker(position, { icon: greenIcon });
        placesMarker.label = '<div style="font-family: MS Sans Serif; color: white; font-size: 14px"><b>Places</b><br>' + places[i].title + '<br>(' + places[i].category.title + ')<br>' + places[i].vicinity + '</div>';
        groupPlaces.addObject(placesMarker);
      }
      groupPlaces.addEventListener('tap', function (evt) {
        map.setCenter(evt.target.getPosition());
        openBubble(evt.target.getPosition(), evt.target.label);
      }, false);
      map.addObject(groupPlaces);
      map.setViewBounds(groupPlaces.getBounds());
    }

 
var styles = {
default:
	null,
	silver: [{
			elementType: 'geometry',
			stylers: [{
					color: '#f5f5f5'
				}
			]
		}, {
			elementType: 'labels.icon',
			stylers: [{
					visibility: 'off'
				}
			]
		}, {
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#616161'
				}
			]
		}, {
			elementType: 'labels.text.stroke',
			stylers: [{
					color: '#f5f5f5'
				}
			]
		}, {
			featureType: 'administrative.land_parcel',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#bdbdbd'
				}
			]
		}, {
			featureType: 'poi',
			elementType: 'geometry',
			stylers: [{
					color: '#eeeeee'
				}
			]
		}, {
			featureType: 'poi',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#757575'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'geometry',
			stylers: [{
					color: '#e5e5e5'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#9e9e9e'
				}
			]
		}, {
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{
					color: '#ffffff'
				}
			]
		}, {
			featureType: 'road.arterial',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#757575'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{
					color: '#dadada'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#616161'
				}
			]
		}, {
			featureType: 'road.local',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#9e9e9e'
				}
			]
		}, {
			featureType: 'transit.line',
			elementType: 'geometry',
			stylers: [{
					color: '#e5e5e5'
				}
			]
		}, {
			featureType: 'transit.station',
			elementType: 'geometry',
			stylers: [{
					color: '#eeeeee'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'geometry',
			stylers: [{
					color: '#c9c9c9'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#9e9e9e'
				}
			]
		}
	],

	night: [{
			elementType: 'geometry',
			stylers: [{
					color: '#242f3e'
				}
			]
		}, {
			elementType: 'labels.text.stroke',
			stylers: [{
					color: '#242f3e'
				}
			]
		}, {
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#746855'
				}
			]
		}, {
			featureType: 'administrative.locality',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#d59563'
				}
			]
		}, {
			featureType: 'poi',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#d59563'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'geometry',
			stylers: [{
					color: '#263c3f'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#6b9a76'
				}
			]
		}, {
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{
					color: '#38414e'
				}
			]
		}, {
			featureType: 'road',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#212a37'
				}
			]
		}, {
			featureType: 'road',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#9ca5b3'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{
					color: '#746855'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#1f2835'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#f3d19c'
				}
			]
		}, {
			featureType: 'transit',
			elementType: 'geometry',
			stylers: [{
					color: '#2f3948'
				}
			]
		}, {
			featureType: 'transit.station',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#d59563'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'geometry',
			stylers: [{
					color: '#17263c'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#515c6d'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'labels.text.stroke',
			stylers: [{
					color: '#17263c'
				}
			]
		}
	],

	retro: [{
			elementType: 'geometry',
			stylers: [{
					color: '#ebe3cd'
				}
			]
		}, {
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#523735'
				}
			]
		}, {
			elementType: 'labels.text.stroke',
			stylers: [{
					color: '#f5f1e6'
				}
			]
		}, {
			featureType: 'administrative',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#c9b2a6'
				}
			]
		}, {
			featureType: 'administrative.land_parcel',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#dcd2be'
				}
			]
		}, {
			featureType: 'administrative.land_parcel',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#ae9e90'
				}
			]
		}, {
			featureType: 'landscape.natural',
			elementType: 'geometry',
			stylers: [{
					color: '#dfd2ae'
				}
			]
		}, {
			featureType: 'poi',
			elementType: 'geometry',
			stylers: [{
					color: '#dfd2ae'
				}
			]
		}, {
			featureType: 'poi',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#93817c'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'geometry.fill',
			stylers: [{
					color: '#a5b076'
				}
			]
		}, {
			featureType: 'poi.park',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#447530'
				}
			]
		}, {
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{
					color: '#f5f1e6'
				}
			]
		}, {
			featureType: 'road.arterial',
			elementType: 'geometry',
			stylers: [{
					color: '#fdfcf8'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{
					color: '#f8c967'
				}
			]
		}, {
			featureType: 'road.highway',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#e9bc62'
				}
			]
		}, {
			featureType: 'road.highway.controlled_access',
			elementType: 'geometry',
			stylers: [{
					color: '#e98d58'
				}
			]
		}, {
			featureType: 'road.highway.controlled_access',
			elementType: 'geometry.stroke',
			stylers: [{
					color: '#db8555'
				}
			]
		}, {
			featureType: 'road.local',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#806b63'
				}
			]
		}, {
			featureType: 'transit.line',
			elementType: 'geometry',
			stylers: [{
					color: '#dfd2ae'
				}
			]
		}, {
			featureType: 'transit.line',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#8f7d77'
				}
			]
		}, {
			featureType: 'transit.line',
			elementType: 'labels.text.stroke',
			stylers: [{
					color: '#ebe3cd'
				}
			]
		}, {
			featureType: 'transit.station',
			elementType: 'geometry',
			stylers: [{
					color: '#dfd2ae'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'geometry.fill',
			stylers: [{
					color: '#b9d3c2'
				}
			]
		}, {
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{
					color: '#92998d'
				}
			]
		}
	],

	paleDawn: [{
			"featureType": "administrative",
			"elementType": "all",
			"stylers": [{
					"visibility": "on"
				}, {
					"lightness": 33
				}
			]
		}, {
			"featureType": "landscape",
			"elementType": "all",
			"stylers": [{
					"color": "#f2e5d4"
				}
			]
		}, {
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [{
					"color": "#c5dac6"
				}
			]
		}, {
			"featureType": "poi.park",
			"elementType": "labels",
			"stylers": [{
					"visibility": "on"
				}, {
					"lightness": 20
				}
			]
		}, {
			"featureType": "road",
			"elementType": "all",
			"stylers": [{
					"lightness": 20
				}
			]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry",
			"stylers": [{
					"color": "#c5c6c6"
				}
			]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry",
			"stylers": [{
					"color": "#e4d7c6"
				}
			]
		}, {
			"featureType": "road.local",
			"elementType": "geometry",
			"stylers": [{
					"color": "#fbfaf7"
				}
			]
		}, {
			"featureType": "water",
			"elementType": "all",
			"stylers": [{
					"visibility": "on"
				}, {
					"color": "#acbcc9"
				}
			]
		}
	],

	avocadoWorld: [{
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [{
					"visibility": "on"
				}, {
					"color": "#aee2e0"
				}
			]
		}, {
			"featureType": "landscape",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#abce83"
				}
			]
		}, {
			"featureType": "poi",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#769E72"
				}
			]
		}, {
			"featureType": "poi",
			"elementType": "labels.text.fill",
			"stylers": [{
					"color": "#7B8758"
				}
			]
		}, {
			"featureType": "poi",
			"elementType": "labels.text.stroke",
			"stylers": [{
					"color": "#EBF4A4"
				}
			]
		}, {
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [{
					"visibility": "simplified"
				}, {
					"color": "#8dab68"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "geometry.fill",
			"stylers": [{
					"visibility": "simplified"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels.text.fill",
			"stylers": [{
					"color": "#5B5B3F"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels.text.stroke",
			"stylers": [{
					"color": "#ABCE83"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels.icon",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "road.local",
			"elementType": "geometry",
			"stylers": [{
					"color": "#A4C67D"
				}
			]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry",
			"stylers": [{
					"color": "#9BBF72"
				}
			]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry",
			"stylers": [{
					"color": "#EBF4A4"
				}
			]
		}, {
			"featureType": "transit",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative",
			"elementType": "geometry.stroke",
			"stylers": [{
					"visibility": "on"
				}, {
					"color": "#87ae79"
				}
			]
		}, {
			"featureType": "administrative",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#7f2200"
				}, {
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative",
			"elementType": "labels.text.stroke",
			"stylers": [{
					"color": "#ffffff"
				}, {
					"visibility": "on"
				}, {
					"weight": 4.1
				}
			]
		}, {
			"featureType": "administrative",
			"elementType": "labels.text.fill",
			"stylers": [{
					"color": "#495421"
				}
			]
		}, {
			"featureType": "administrative.neighborhood",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}
	],

	bright: [{
			"featureType": "all",
			"elementType": "all",
			"stylers": [{
					"saturation": "20"
				}, {
					"lightness": "-3"
				}, {
					"visibility": "on"
				}, {
					"weight": "1.18"
				}
			]
		}, {
			"featureType": "administrative",
			"elementType": "labels",
			"stylers": [{
					"visibility": "on"
				}
			]
		}, {
			"featureType": "landscape",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "landscape.man_made",
			"elementType": "all",
			"stylers": [{
					"saturation": "-70"
				}, {
					"lightness": "14"
				}
			]
		}, {
			"featureType": "poi",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "transit",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "water",
			"elementType": "all",
			"stylers": [{
					"saturation": "100"
				}, {
					"lightness": "-14"
				}
			]
		}, {
			"featureType": "water",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}, {
					"lightness": "12"
				}
			]
		}
	],

	turquoise: [{
			"featureType": "administrative",
			"elementType": "all",
			"stylers": [{
					"visibility": "on"
				}
			]
		}, {
			"featureType": "administrative.country",
			"elementType": "all",
			"stylers": [{
					"visibility": "on"
				}, {
					"color": "#00858a"
				}
			]
		}, {
			"featureType": "administrative.country",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative.province",
			"elementType": "all",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative.locality",
			"elementType": "all",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative.neighborhood",
			"elementType": "all",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "administrative.land_parcel",
			"elementType": "all",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "landscape.man_made",
			"elementType": "geometry",
			"stylers": [{
					"color": "#f6ebcb"
				}
			]
		}, {
			"featureType": "landscape.natural",
			"elementType": "geometry",
			"stylers": [{
					"color": "#f7f1df"
				}
			]
		}, {
			"featureType": "landscape.natural.landcover",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#f7f1df"
				}
			]
		}, {
			"featureType": "landscape.natural.terrain",
			"elementType": "geometry",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "landscape.natural.terrain",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#f7f1df"
				}
			]
		}, {
			"featureType": "poi",
			"elementType": "labels",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "poi.business",
			"elementType": "all",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "poi.government",
			"elementType": "all",
			"stylers": [{
					"visibility": "on"
				}, {
					"color": "#f3dd9d"
				}
			]
		}, {
			"featureType": "poi.medical",
			"elementType": "geometry",
			"stylers": [{
					"color": "#fbd3da"
				}, {
					"visibility": "on"
				}
			]
		}, {
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [{
					"color": "#bde6ab"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "geometry.stroke",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels",
			"stylers": [{
					"visibility": "on"
				}
			]
		}, {
			"featureType": "road",
			"elementType": "labels.icon",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry.stroke",
			"stylers": [{
					"color": "#f8a179"
				}
			]
		}, {
			"featureType": "road.highway",
			"elementType": "labels.icon",
			"stylers": [{
					"visibility": "off"
				}
			]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#ffffff"
				}
			]
		}, {
			"featureType": "road.local",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#ffffff"
				}
			]
		}, {
			"featureType": "transit.station.airport",
			"elementType": "geometry.fill",
			"stylers": [{
					"color": "#e6dcbd"
				}
			]
		}, {
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [{
					"color": "#3dbbc2"
				}
			]
		}
	],

	hiding: [{
			featureType: 'poi.business',
			stylers: [{
					visibility: 'off'
				}
			]
		}, {
			featureType: 'transit',
			elementType: 'labels.icon',
			stylers: [{
					visibility: 'off'
				}
			]
		}
	]
};
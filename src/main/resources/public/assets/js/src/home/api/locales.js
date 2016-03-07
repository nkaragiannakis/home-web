var callAPI = require('./base');

var LocaleAPI = {
	fetchLocaleMessages: function(locale) {
		return callAPI('/assets/js/build/home/i18n/' + locale + '.js', null, "GET");
	}	
};

module.exports = LocaleAPI;


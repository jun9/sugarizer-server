// include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	chartList = require('./util/chartList')();

var stats = require('./index');

module.exports = function editChart(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.params.chartid) {
		if (req.method == 'POST') {

			// validate
			req.body.title = req.body.title.trim();
			if (req.body.title) {
				req.assert('title', common.l10n.get('TitleInvalid')).matches(/^[a-z0-9 ]+$/i);
			} else {
				req.body.title = "";
			}
			if (req.body.hidden) req.body.hidden = true;
			var isValidChart = false;
			for (var i=0; i<chartList.length; i++) {
				if (chartList[i].key == req.body.key) {
					isValidChart = true;
					req.body.type = chartList[i].type;
				}
			}
			if (!isValidChart) {
				req.flash('errors', {
					msg: common.l10n.get('InvalidChart')
				});
				return res.redirect('/dashboard/stats/edit/' + req.params.chartid);
			}

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				superagent
					.put(common.getAPIUrl(req) + 'api/v1/charts/' + req.params.chartid)
					.set(common.getHeaders(req))
					.send({
						chart: JSON.stringify(req.body)
					})
					.end(function (error, response) {
						if (response.statusCode == 200) {

							// send back
							req.flash('success', {
								msg: common.l10n.get('ChartUpdated', {title: req.body.title})
							});
							return res.redirect('/dashboard/stats/list');
						} else {
							req.flash('errors', {
								msg: common.l10n.get('ErrorCode'+response.body.code)
							});
							return res.redirect('/dashboard/stats/edit/' + req.params.chartid);
						}
					});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/stats/edit/' + req.params.chartid);
			}
		} else {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/charts/' + req.params.chartid)
				.set(common.getHeaders(req))
				.end(function (error, response) {
					if (response.statusCode == 200) {
						// send to stats page
						res.render('admin/addEditChart', {
							module: 'stats',
							mode: "edit",
							chart: response.body,
							moment: moment,
							charts: chartList,
							account: req.session.user,
							server: stats.ini().information
						});
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+response.body.code)
						});
						return res.redirect('/dashboard/stats/list');
					}
				});
		}
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/stats/list');
	}
};

$(function()
{
	var version = chrome.app.getDetails().version;
	$("#version").html(version);
	PageI18N();
});


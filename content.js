chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) 
	{
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
			if (request.greeting == "showDialog")
			{
				ShowDialog();
				
				sendResponse({farewell: "goodbye"});
				
				//iframe.style.display = 'none';
			}
			else if(request.greeting == "closeIFrame")
			{
				$(".whizkey-iframe-inject").remove();
			}
	}
);

/**
* Opens an iframe on the current page to show the password generator.
* Always opens the iframe on top of all other elements.
*/
function ShowDialog()
{
	//var ui = new PasswordUI();
	//ui.show();
	
	var iframe = document.createElement('iframe');
	iframe.src = chrome.extension.getURL("dialog/dialog_popup.html");
	iframe.className = 'whizkey-iframe-inject';
	iframe.frameBorder = 0;
	
	var index_highest = GetMaxZ($("*"));	
	iframe.style.zIndex=(index_highest+1);
	
	document.body.appendChild(iframe);
}

/**
* Get the maximal z-index of all elements in the current dom.
* @param {string} selector JQuery selector of elements to consider.
*/
function GetMaxZ(selector)
{
    return Math.max.apply(null, $(selector).map(function()
	{
        var z;
        return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
    }));
}
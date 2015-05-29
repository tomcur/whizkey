chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) 
	{
		if (request.greeting == "hello")
		{
			sendResponse({farewell: "goodbye"});
		}
		else if(request.greeting == "getDomainInfo")
		{
			console.log("Checking active tab URL");
			respond = {farewell: "domainUserInfo"};
			
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
			{
				//sendResponse({farewell: tabs[0].url});
				respond.url = tabs[0].url;
				sendResponse(respond);
			});
						
			// Keep event listener open
			return true;
		}
		else if(request.greeting == "closeIFrame")
		{
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
			{
				chrome.tabs.sendMessage(tabs[0].id, {greeting: "closeIFrame"});
			});
		}
		else if(request.greeting == "getVaults")
		{
			sendResponse({farewell: "goodbye", data: vaults});
		}
		else if(request.greeting == "getDefaultVault")
		{
			sendResponse({farewell: "goodbye", data: GetDefaultVault()});
		}
		else if(request.greeting == "saveVault")
		{
			SaveVault(request.data);
		}
	}
);
 
/**
 * Saves the provided vault. Overwrites if it exists already.
 * @param {vaultdata} vault The vault to save.
 */
function SaveVault(vault)
{
	console.log("Saving: ");
	console.log(vault);
	var name = vault["name"];
	
	for(var key in vaults)
	{
		if(vaults[key]["name"] == name)
		{
			vaults[key] = vault;
			SaveVaults();
			return;
		}
	}
	
	vaults.push(vault);
	SaveVaults();
}
 
/**
 * Saves the current vaults to the local storage.
 */
function SaveVaults()
{
	console.log(vaults);
	chrome.storage.local.set({'vaults': vaults});
}

/**
 * Saves the default vault to the local storage.
 */
function SaveDefaultVault()
{
	chrome.storage.local.set({'defaultVault': defaultVault});
}

/**
 * Opens a url in a new tab.
 * @param {string} url The url of the page to open.
 */
function OpenPage(url)
{
	chrome.tabs.create({url: url});
}

/**
 * Get the default vault (or the first if no default has been selected).
 * @returns {vaultdata} The default vault if it exists, null otherwise.
 */
function GetDefaultVault()
{
	if(typeof defaultVault === 'undefined')
	{
		if(vaults.length > 0)
		{
			return vaults[0];
		}
		else
		{
			return null;
		}
	}
	else
	{
		return GetVaultByName(defaultVault);
	}
}

/**
 * Get vault by name.
 * @param {string} name The vault name.
 * @returns {vaultdata} The vault associated with the name if it exists, null otherwise.
 */
function GetVaultByName(name)
{
	for(var key in vaults)
	{
		var vault = vaults[key];
		if(vault["name"] == name)
		{
			return vault;
		}
	}
	
	return null;
}

/**
 * Opens/injects the password dialog on the current tab.
 */
function PasswordDialog()
{
	// Send message to active tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
	{
		data = {greeting: "showDialog"};
		chrome.tabs.sendMessage(tabs[0].id, data, function(response) 
		{
		});
	});
}

/**
 * Loads the settings and vaults
 */
function Load()
{
	chrome.storage.local.get(['vaults', 'defaultVault'], function(result)
	{
			vaults = result.vaults;
			defaultVault = result.defaultVault;
			console.log(result);
			if(vaults === undefined)
			{
				vaults = [];
			}
	});
}

/**
 * Delete all local data.
 */
function DeleteAllData()
{
	chrome.storage.local.clear();
	vaults = [];
}

Load();
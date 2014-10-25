/**
* Send a message to the background thread.
* @param {object} msg The message to send.
* @param {function} callback The callback to call.
*/
function MessageBackground(msg, callback)
{
	chrome.runtime.sendMessage(msg, function(response) 
	{
		callback(response);
	});
}

/**
* Send the new vault to the background thread for saving.
* @param {vault} vault The vault to save.
*/
function SaveVault(vault)
{
	MessageBackground({greeting: "saveVault", data: vault.vault}, function(response)
	{
		// TO-DO: error checking
	});
}

//var hashtest = CryptoJS.SHA512("test");
//console.log("hash: " + hashtest);


/**
* Populate dialog information
*/
function Populate()
{	
	if(!vault.IsVault())
	{
		$('#content').html('<h2>Please select a vault first.</h2><p>Go to Options -> Add Vault.</p>');
		return;
	}
	
	MessageBackground({greeting: "getDomainInfo"}, function(response)
	{
		console.log(vault);
		var host = $.url(response.url).attr('host');
		tld = window.publicSuffixList.getDomain(host).toLowerCase();
		$('.domainname').html(tld);
		$('#default-vault').html(vault["name"]);
		
		var linkedTo = vault.GetDomainLink(tld);
			
		accounts = [];
		var accountsDomain = vault.GetAccounts(tld);
		var accountsLink = [];
		if(linkedTo != null)
		{
			var accountsLink = vault.GetAccounts(linkedTo);
			$('#domain-link-title').html('(' + linkedTo + ')');
		}
		
		var i = 0;
		// Merge domain and link accounts
		for(var key in accountsDomain)
		{
			accounts.push({"id": i, "account": accountsDomain[key], "val": accountsDomain[key], "domain": tld});
			i++;
		}
		for(var key in accountsLink)
		{
			accounts.push({"id": i, "account": accountsLink[key], "val": accountsLink[key] + " (link)", "domain": linkedTo});
			i++;
		}
		
		//var accounts = vault.GetAccounts(tld);

		
		console.log(accounts);
		// Add accounts to account selection
		for(var key in accounts)
		{
			var account = accounts[key];
			$('#account').append($('<option/>', { 
				value: account["id"],
				text : account["val"]
			}));
		}
		
		var domains = vault.GetDomainNames();
		
		// Add domains to domain selection
		for(var key in domains)
		{
			var domain = domains[key];
			var linkedTo = vault.GetDomainLink(domain);
			if(domain == tld || linkedTo != null)
			{
				continue;
			}
			
			$('#linkto').append($('<option/>', { 
				value: domain,
				text : domain
			}));
		}
		
		if(accounts.length > 0)
		{
			// Generate password
			Generate();
		}
	});
}

/**
* Add an account
*/
function AddAccount()
{
	var name = $("#newaccount-name").val();
	var checked = $("#newaccount-advanced").prop('checked');
	
	var count = 1;
	if(checked)
	{
		count = parseInt($("#newaccount-count").val());
	}
	
	if(name == "")
	{
		$("#newaccount-status").html("<p>Please enter an account name.</p>");
	}
	else if(!(count >= 1))
	{
		$("#newaccount-status").html("<p>Please enter a count of 1 or higher.</p>");
	}
	else
	{
		var linkedTo = vault.GetDomainLink(tld);
		var addTo = tld;
		if(linkedTo != null)
		{
			addTo = linkedTo;
		}
		
		if(vault.GetAccounts(addTo).indexOf(name) >= 0)
		{
			$("#newaccount-status").html("<p>That account already exists for " + addTo + "</p>");
		}
		else
		{		
			vault.AddAccount({"name": name, "count": count}, addTo);
			SaveVault(vault);
			
			
			$("#whizkey-new-account").hide(100, function()
			{
				$("#whizkey-new-success").show(100);
			});
		}
	}
}

/**
* Generates a password for the given account.
*/
function Generate()
{
	var accountID = $('#account').val();
	var account = accounts[accountID];
	var masterPassword = $('#masterPassword').val();
	
	$("#password").val(GeneratePassword(vault, account["domain"], account["account"], masterPassword));
}

/**
* Add the domain link.
*/
function LinkDomain()
{
	var linkTo = $("#linkto").val();
	
	// Unlink
	if(linkTo == vault.GetDomainLink(tld))
	{
		if(vault.UnlinkDomain(tld))
		{
			SaveVault(vault);
		
			$("#linkto-status").html("Unlinked!");
		}
		else
		{
			$("#linkto-status").html("Could not unlink...");
		}
	}
	else
	{
		if(vault.SetDomainLink(tld, linkTo))
		{
			SaveVault(vault);
		
			$("#linkto-status").html("Link was saved!");
		}
		else
		{
			$("#linkto-status").html("Link was not saved...");
		}
	}
}

$(function()
{
	PageI18N();
	
	// Hide password by default, add toggle button
	$('#password').hideShowPassword(false, true);
	
	$("#linkwebsite").click(function()
	{
		$("#whizkey-gen").hide(100, function()
		{
			$("#whizkey-link-domain").show(100);
		});
	});
	
	$("#gen-cancel").click(function()
	{
		MessageBackground({greeting: "closeIFrame"});
	});
	
	$("#account").on('change', function()
	{
		Generate();
	});
	
	$("#masterPassword").keyup(function()
	{
		Generate();
	});
	
	$("#newaccount").click(function()
	{
		$("#whizkey-gen").hide(100, function()
		{
			$("#whizkey-new-account").show(100);
		});
	});
	
	$("#newaccount-advanced").on('change', function()
	{
		if(this.checked)
		{
			$("#whizkey-new-advanced").show(100);
		}
		else
		{
			$("#whizkey-new-advanced").hide(100);
		}
	});
	
	$("#newaccount-submit").click(function()
	{
		AddAccount();
	});
	
	$("#linkto-submit").click(function()
	{
		LinkDomain();
	});
	
	// Load TLD list
	$.ajax({
		type: 'GET',
		url: '../data/effective_tld_names.dat',
		success: function (list) 
		{
			window.publicSuffixList.parse(list, punycode.toASCII);
			
			// Load default vault
			MessageBackground({greeting: "getDefaultVault"}, function(response) 
			{
				vault = new Vault(response.data);
				// Populate dialog information
				Populate();
			});
		}
	});
});


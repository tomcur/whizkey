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
		$('#default-vault').html(vault.GetName());
		
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
	var type = "medium";
	if(checked)
	{
		count = parseInt($("#newaccount-count").val());
		type = parseInt($("#newacount-type").val());
	}
	
	if(name == "")
	{
		$("#newaccount-status").html("<p>Please enter an account name.</p>");
	}
	else if(!(count >= 1))
	{
		$("#newaccount-status").html("<p>Please enter a count of 1 or higher.</p>");
	}
	else if(["secure", "long", "medium", "short", "pin"].indexOf(type) == -1)
	{
		$("#newaccount-status").html("<p>Please enter a valid password type.</p>");
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
			vault.AddAccount({"name": name, "type": type, "count": count}, addTo);
			SaveVault(vault);
			
			
			$("#whizkey-new-account").hide(100, function()
			{
				$("#whizkey-new-success").show(100);
			});
		}
	}
}

function Shake(element)
{
	$(element).css({"position": "absolute"});
	$(element).animate({left: '5px'}, 100, function()
	{
		$(element).animate({left: '-5px'}, 100, function()
		{
			$(element).animate({left: '5px'}, 100, function()
			{
				$(element).animate({left: '0px'}, 100);
			});
		});
	});
}

/**
* Generates a password for the given account and shows it.
*/
function Generate()
{
	var masterPassword = $('#masterPassword').val();
	var accountID = $('#account').val();
	var account = accounts[accountID];
	
	var msg = masterPassword + vault.GetFirstName().toLowerCase() + vault.GetBirthplace().toLowerCase();
	var md = forge.md.sha512.create();
	md.update(msg);
	var hash = md.digest().toHex();
	
	if(hash != vault.GetHash())
	{
		// Shake the password box if the password is wrong
		Shake($("#masterPassword"));
		return;
	}
	
	if(accountID == "" || accountID == null)
	{
		Shake($("#account"));
	}	
	
	
	password = GeneratePassword(vault, account["domain"], account["account"], masterPassword);
	
	var mask = "";
	for(i = 0; i < password.length; i++)
	{
		mask = mask + "*";
	}
	$('#password-mask-text').html(mask);
	$('#password-nomask-text').html(password);
	
	$('#generate-button').hide();
	$('#generated').show();
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

/**
* Copy text to clipboard.
* @param {string} text The text to copy.
*/
function CopyToClipboard(text)
{
    var copyFrom = $('<textarea/>');
    copyFrom.text(text);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy', true);
    copyFrom.remove();
}

/**
* Checks whether the master password is correct.
*/
function CheckPassword()
{
	var masterPassword = $("#masterPassword").val();
	
	var msg = masterPassword + vault.GetFirstName().toLowerCase() + vault.GetBirthplace().toLowerCase();
	var md = forge.md.sha512.create();
	md.update(msg);
	var hash = md.digest().toHex();
	
	if(hash == vault.GetHash())
	{
		if(!$("#passwordCorrect").is(":visible"))
		{
			$("#passwordCorrect").fadeIn(250);
		}
	}
	else
	{
		if($("#passwordCorrect").is(":visible"))
		{
			$("#passwordCorrect").fadeOut(250);
		}
	}
}

$(function()
{
	password = "";

	// Fill with translation
	PageI18N();
	
	// Hide password by default, add toggle button
	$('#password').hideShowPassword(false, true);
	
	// Return
	$('.whizkey-return').click(function()
	{
		Populate();
		$('#whizkey-new-account, #whizkey-link-domain, #whizkey-new-success').hide(100, function()
		{
			$('#whizkey-gen').show(100);
		});
	});
	
	// Link website link
	$("#linkwebsite").click(function()
	{
		$("#whizkey-gen").hide(100, function()
		{
			$("#whizkey-link-domain").show(100);
		});
	});
	
	// Close text
	$("#close-button").click(function()
	{
		MessageBackground({greeting: "closeIFrame"});
	});
	
	// Master password, on key up
	$("#masterPassword").keyup(function(e)
	{
		CheckPassword();
		
		// Enter pressed, generate the password
		if(e.which == 13) 
		{
			Generate();
		}
	});
	
	// Generate, show, and copy buttons
	$("#generate-button").click(function()
	{
		Generate();
	});
	
	$("#password-copy").click(function()
	{
		CopyToClipboard(password);
	});
	
	$("#password-generated").click(function()
	{
		$("#generated").hide();
		$("#generated-nomask").show();
	});
	
	// Add account link
	$("#newaccount").click(function()
	{
		$("#whizkey-gen").hide(100, function()
		{
			$("#whizkey-new-account").show(100);
		});
	});
	
	// "Advanced" checkbox
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
	
	// Add account button
	$("#newaccount-submit").click(function()
	{
		AddAccount();
	});
	
	// Link account button
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


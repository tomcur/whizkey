// Saves options to chrome.storage
/*
function save_options() {
  var color = document.getElementById('color').value;
  var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
*/

var bg = chrome.extension.getBackgroundPage();

/**
* Called if page hash is changed (options.html#someHash).
* @param {string} hash The new hash.
*/
function HashChanged(hash)
{
	switch(hash)
	{
		case "#vaults":
			var show = "#vaults";
			break;
		case "#addvault":
			var show = "#addvault";
			break;
		case "#export":
			var show = "#export";
			break;
		case "#import":
			var show = "#import";
			break;
		case "#general":
		default:
			var show = "#general";
			break;
	}

	vis = $(".paging:visible");
	if(vis.length == 0)
	{
		$(show).show();
	}
	else
	{
		vis.hide(100, function() {	
			$(show).show(100);
		});
	}
}

/**
 * Checks whether a vault name already exists.
 * @param {string} vaultName Name of vault to check
 * @param {array} vaults Vaults to check against.
 * @returns {Boolean} True if vault is in array, false otherwise.
 */ 
function VaultExists(vaultName, vaults)
{
	for (var key in vaults)
	{
		var vault = vaults[key];
		if(vault["name"].toLowerCase() == vaultName.toLowerCase())
		{
			return true;
		}
	}
	
	return false;
}

/**
 * Attempt to add a vault
 */
function AddVault()
{
	var vaultName = $("#addvault_name").val();
	
	var password = $("#addvault_password").val();
	var passwordConfirm = $("#addvault_password_confirm").val();
	
	var firstName = $("#addvault_firstname").val();
	var birthplace = $("#addvault_birthplace").val();
	
	if(vaultName == "")
	{
		$("#addvault_status").html("Please enter a valid vault name.");
	}
	else if(password == "")
	{
		$("#addvault_status").html("Please enter a master password.");
	}
	else if(password != passwordConfirm)
	{
		$("#addvault_status").html("Passwords do not match.");
	}
	else if(firstName == "")
	{
		$("#addvault_status").html("Please enter a valid first name.");
	}
	else if(birthplace == "")
	{
		$("#addvault_status").html("Please enter a valid birthplace.");
	}
	else if(VaultExists(vaultName, bg.vaults))
	{
		$("#addvault_status").html("You already have a vault with that name. Please enter a new vault name.");
	}
	else
	{
		var msg = password + firstName.toLowerCase() + birthplace.toLowerCase();
		var md = forge.md.sha512.create();
		md.update(msg);
		var hash = md.digest().toHex();
		
		bg.vaults.push({"name": vaultName, "firstName": firstName, "birthplace": birthplace, "hash": hash, "store": []});
		bg.SaveVaults();
		
		$("#addvault_container").hide(100, function(response)
		{
			$("#addvault_success").show(100);
		});
	}
}

/**
* Populate the 
*/
function Populate()
{
	PageI18N();

	var vaults = bg.vaults;
	vaults.sort(function(a, b)
	{
		if (a.name < b.name)
			return -1;
		if (a.name > b.name)
			return 1;
		return 0;
	});
	
	
	var table = $('#vault-list-table > tbody');
	for(var vKey in vaults)
	{
		var v = vaults[vKey];
		var vault = new Vault(v);
		
		table.append('<tr data-tt-id="level_1_'+vKey+'"><td>'+vault.GetName()+'</td><td>'+vault.GetFirstName()+' / '+vault.GetBirthplace()+'</td></tr>');
		
		var domains = vault.GetDomainNames();
		domains.sort();
		for(dKey in domains)
		{
			var domain = domains[dKey];
			
			var linkedTo = vault.GetDomainLink(domain);
			
			if(linkedTo == null)
			{
				table.append('<tr data-tt-id="level_2_'+dKey+'" data-tt-parent-id="level_1_'+vKey+'"><td>'+domain+'</td><td></td></tr>');
			}
			else
			{
				//table.append('<tr data-tt-id="level_3_link" data-tt-parent-id="level_2_'+dKey+'"><td>Link: '+linkedTo+'</td><td></td></tr>');
				table.append('<tr data-tt-id="level_2_'+dKey+'" data-tt-parent-id="level_1_'+vKey+'"><td>'+domain+'</td><td>'
				+chrome.i18n.getMessage('option_vault_linked_to')+
				': '+linkedTo+'</td></tr>');
			}
			
			var accounts = vault.GetAccounts(domain);
			accounts.sort();
			for(aKey in accounts)
			{
				var account = accounts[aKey];
				var acc = vault.GetAccount(account, domain);
				
				table.append('<tr data-tt-id="level_3_'+aKey+'" data-tt-parent-id="level_2_'+dKey+'"><td>'+account+'</td><td>'
				+chrome.i18n.getMessage('ptype_count')+
				': '+acc["count"]+', '
				+chrome.i18n.getMessage('ptype_type')+
				': secure</td></tr>');
			}
		}
	}
	
	$('#vault-list-table').treetable({
		"expandable": true,
		"clickableNodeNames": true
	});
	
	if(vault != null)
	{
		$('#export-field').val(vault.JSON("    "));
	}
	
}

/**
* Merge the obj vaults with the current vaults.
* @param {vaults} obj The vaults to merge.
*/
function Import(obj)
{
	alert("Does nothing yet");
}

var storedHash = window.location.hash;
$(function()
{
	HashChanged(storedHash);
	Populate();
	
	window.setInterval(function () {
		if (window.location.hash != storedHash) {
			storedHash = window.location.hash;
			HashChanged(storedHash);
		}
	}, 100);
	
	// Reset data
	$("#clear-data").click(function()
	{
		var r = confirm("Are you sure you wish to delete ALL data?");
		if (r == true) 
		{
			bg.DeleteAllData();
		} 
		else 
		{
			
		}
	});
	
	
	// Add vault send
	$("#addvault_form").submit(function(event)
	{
		event.preventDefault();
		event.stopImmediatePropagation();
		AddVault();
	});
	
	// Select export textarea text on focus
	$("#export-field").focus(function() 
	{
		var $this = $(this);
		$this.select();

		// Work around Chrome's little problem
		$this.mouseup(function() 
		{
			// Prevent further mouseup intervention
			$this.unbind("mouseup");
			return false;
		});
	});
	
	// Bind to import button
	$("#import-field-button").click(function()
	{
		var str = $("#import-field").val();
		
		try
		{
			var obj = JSON.parse(str);
			Import(obj);
			
			$('#import-status').html("Successfully imported.");
		}
		catch(err)
		{
			$('#import-status').html("Import error: " + err);
		}
	});
});
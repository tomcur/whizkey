var bg = chrome.extension.getBackgroundPage();

$(function() {
	$("#new-vault").click(function()
	{
		bg.OpenPage("options/options.html#addvault");
	});

	$("#get-password").click(function()
	{
		bg.PasswordDialog();
	});

	$("#options").click(function() 
	{
		bg.OpenPage("options/options.html");
	});
	
	$("#about").click(function()
	{
		bg.OpenPage("about/about.html");
	});

	$("#vault" ).on('change', function() 
	{
		alert('test');
		bg.defaultVault = this.value;
		bg.SaveDefaultVault();
	});
	
	PageI18N();
	PopulateVaultSelect();
});

function PopulateVaultSelect()
{
	for(var key in bg.vaults)
	{
		var vault = bg.vaults[key];
		$('#vault').append($('<option/>', { 
			value: vault["name"],
			text : vault["name"]
		}));
	}
	
	var selected = bg.GetDefaultVault();
	if(selected !== null)
	{
		$("#vault").val(selected["name"]);
	}
}
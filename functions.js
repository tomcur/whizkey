/**
* Class representing a vault and the methods that
* can be performed on it.
*/
function Vault(vault)
{
	this.vault = vault;
	
	/**
	* @returns {string} Vault name
	*/
	this.GetName = function()
	{
		return this.vault.name;
	};
	
	/**
	* @returns {string} First Name
	*/
	this.GetFirstName = function()
	{
		return this.vault.firstName;
	};
	
	/**
	* @returns {string} Birthplace
	*/
	this.GetBirthplace = function()
	{
		return this.vault.birthplace;
	};
	
	/**
	* @returns {string} Hash
	*/
	this.GetHash = function()
	{
		return this.vault.hash;
	};
	
	/**
	* Checks whether the vault object contains an actual vault.
	* @returns {boolean} True if object is a vault, false otherwise.
	*/
	this.IsVault = function()
	{
		return this.vault != null;
	};
	
	/**
	* Get list of names of domains in the vault.
	* @returns {boolean} The list of domain names in the vault.
	*/
	this.GetDomainNames = function()
	{
		var list = [];
		for(var key in this.vault.store)
		{
			list.push(this.vault.store[key]["name"]);
		}
		
		return list;
	};
	
	/**
	* Add a domain to the vault.
	* @param {string} domain The domain to add.
	* @returns {boolean} True if domain was added, false otherwise.
	*/
	this.AddDomain = function(domain)
	{
		var list = this.GetDomainNames();
		
		// Domain is not in list yet
		if(list.indexOf(domain)  == -1)
		{
			this.vault.store.push({"name": domain});
			return true;
		}
		
		return false;
	};
	
	/**
	* Get the key of the domain (i.e., this.vault.store[key]).
	* @param {string} domain The domain.
	* @returns {number} The key of the domain or -1 if
	* the domain does not exist.
	*/
	this.GetDomainKey = function(domain)
	{
		for(var key in this.vault.store)
		{
			if(this.vault.store[key]["name"] == domain)
			{
				return key;
			}
		}
		
		return -1;
	};
	
	/**
	* Add the domain if it does not exist and get the key.
	* @param {string} domain The domain.
	* @returns {number} The key of the domain.
	*/
	this.GetDomainKeyAddIfNotExists = function(domain)
	{
		this.AddDomain(domain);
		return this.GetDomainKey(domain);
	};
	
	/**
	* Get a list of account names in the domain.
	* @param {string} domain The domain to grab accounts for.
	*/
	this.GetAccounts = function(domain)
	{
		var key = this.GetDomainKey(domain);
		if(key >= 0)
		{
			var domainStore = this.vault.store[key].accounts;
			if(typeof domainStore === 'undefined')
			{
				return [];
			}
			else
			{
				var accounts = [];
				for(var accountKey in domainStore)
				{
					console.log(domainStore[accountKey]);
					accounts.push(domainStore[accountKey]["name"]);
				}
				
				return accounts;
			}
		}
		else
		{
			return [];
		}
	};
	
	/**
	* Add an account to a domain in the vault.
	* @param {name: string, count: number} account The account to add.
	* @param {string} domain The domain to add.
	*/
	this.AddAccount = function(account, domain)
	{
		//Add the domain if it does not exist and get its key		
		var key = this.GetDomainKeyAddIfNotExists(domain);
		
		// Add account to domain
		if(typeof this.vault.store[key].accounts === 'undefined')
		{
			this.vault.store[key].accounts = [];
		}
		
		var accounts = this.GetAccounts(domain);
		if(accounts.indexOf(account) == -1)
		{
			this.vault.store[key].accounts.push(account);
			
			return true;
		}
		
		return false;
	};
	
	/**
	* Get an account from its name and the domain its in. Null if it does not exist.
	* @param {string} account The account name.
	* @param {string} domain The domain the account is in.
	* @returns {name: string, count: number} The account or null if it does not exist.
	*/
	this.GetAccount = function(account, domain)
	{
		var key = this.GetDomainKey(domain);
		
		var accounts = this.vault.store[key].accounts;
		if(typeof accounts === 'undefined')
		{
			return null;
		}
		
		for(var accountKey in accounts)
		{
			var acc = accounts[accountKey];
			if(acc["name"] == account)
			{
				return acc;
			}
		}
		
		return null;
	};
	
	/**
	* Get the domain the given domain is linked to. Null if
	* the given domain is not linked to a domain.
	* @param {string} domain The domain to get the link of.
	* @returns {string} The name of the domain that the
	* domain is linked to.
	*/
	this.GetDomainLink = function(domain)
	{
		var key = this.GetDomainKey(domain);
		if(key >= 0)
		{
			if(typeof this.vault.store[key].link !== 'undefined')
			{
				return this.vault.store[key].link;
			}
			else
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	};
	
	/**
	* Set the domain a domain is linked to.
	* @param {string} domain The domain to set a link for.
	* @param {string} linkToDomain The domain the domain should
	* be linked to.
	* @returns {boolean} True if the link was set, false otherwise.
	*/
	this.SetDomainLink = function(domain, linkToDomain)
	{
		var key = this.GetDomainKeyAddIfNotExists(domain);
		var linkKey = this.GetDomainKey(linkToDomain);
		
		if(key >= 0)
		{	// Both domain and linkToDomain exist, so set the link
			this.vault.store[key].link = linkToDomain;
			return true;
		}
		else
		{
			return false;
		}
	}
	
	/**
	* Unlink the domain.
	* @param {string} domain The domain to unlink.
	* @returns {boolean} True if the link was unlinked, false otherwise.
	*/
	this.UnlinkDomain = function(domain)
	{
		var key = this.GetDomainKey(domain);
		
		if(key >= 0 && typeof this.vault.store[key].link === 'string')
		{
			delete this.vault.store[key].link;
			return true;
		}
		
	}
	
	/**
	* Get the vault in JSON format.
	* @param {number or string} indent Optional. Indentation of JSON output.
	* @returns {string} JSON of the vault.
	*/
	this.JSON = function(indent)
	{
		indent = typeof indent !== 'undefined' ? indent : 0;
		return JSON.stringify(this.vault, null, indent);
	}
}

/**
 * Calculate the checksum of the password.
 * @param {string} password The password to get the checksum of.
 * @param {string} firstName The first name to use in the salt
 * @param {string} birthplace The birthplace to use in the salt
 * @returns The checksum of the password.
 */
function ChecksumHash(password, firstName, birthplace)
{
	var salt = firstName.toLowerCase() + birthplace.toLowerCase();
	
	var md = forge.md.sha512.create();
	md.update(password + salt);
	var hash = md.digest().toHex();
	
	// Iterate for a bit of extra security
	for(var i = 0; i < 100; i++)
	{
		md.update(hash + salt);
		hash = md.digest().toHex();
	}
	
	return hash;
}

/**
* Replaces placeholders in the current DOM with translations 
* from the appropriate messages.json.
*/
function PageI18N()
{
	$("[data-i18n]").each(
		function()
		{
			$(this).html(chrome.i18n.getMessage($(this).attr("data-i18n")));
		}
	);
	
	$("[data-i18n-value]").each(
		function()
		{
			$(this).val(chrome.i18n.getMessage($(this).attr("data-i18n-value")));
		}
	);
}

/**
* Generates a password for the given account in the given vault.
* @param {vault} vault The vault to generate a password from.
* @param {string} domainName The domain name to generate for.
* @param {string} accountName The account name to generate for.
* @param {string} masterPassword The master password.
* @returns {string} The password.
*/
function GeneratePassword(vault, domainName, accountName, masterPassword)
{
	// Get account from domain name and account name
	var acc = vault.GetAccount(accountName, domainName);
	console.log(vault);
	console.log(domainName);
	console.log(accountName);
	htp = new DataToPassword(vault.GetFirstName(), vault.GetBirthplace(), domainName, acc["name"], acc["count"], masterPassword);
	
	switch(acc["type"])
	{
		case "long":
			return htp.GetLongPassword();
		case "medium":
		default:
			console.log("MEDIUM");
			return htp.GetMediumPassword();
	}
}

/**
 * Purl (A JavaScript URL parser) v2.3.1
 * Developed and maintanined by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 * Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
 */
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.purl = factory();
    }
})(function() {

    var tag2attr = {
            a       : 'href',
            img     : 'src',
            form    : 'action',
            base    : 'href',
            script  : 'src',
            iframe  : 'src',
            link    : 'href',
            embed   : 'src',
            object  : 'data'
        },

        key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'], // keys available to query

        aliases = { 'anchor' : 'fragment' }, // aliases for backwards compatability

        parser = {
            strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,  //less intuitive, more accurate to the specs
            loose :  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
        },

        isint = /^[0-9]+$/;

    function parseUri( url, strictMode ) {
        var str = decodeURI( url ),
        res   = parser[ strictMode || false ? 'strict' : 'loose' ].exec( str ),
        uri = { attr : {}, param : {}, seg : {} },
        i   = 14;

        while ( i-- ) {
            uri.attr[ key[i] ] = res[i] || '';
        }

        // build query and fragment parameters
        uri.param['query'] = parseString(uri.attr['query']);
        uri.param['fragment'] = parseString(uri.attr['fragment']);

        // split path and fragement into segments
        uri.seg['path'] = uri.attr.path.replace(/^\/+|\/+$/g,'').split('/');
        uri.seg['fragment'] = uri.attr.fragment.replace(/^\/+|\/+$/g,'').split('/');

        // compile a 'base' domain attribute
        uri.attr['base'] = uri.attr.host ? (uri.attr.protocol ?  uri.attr.protocol+'://'+uri.attr.host : uri.attr.host) + (uri.attr.port ? ':'+uri.attr.port : '') : '';

        return uri;
    }

    function getAttrName( elm ) {
        var tn = elm.tagName;
        if ( typeof tn !== 'undefined' ) return tag2attr[tn.toLowerCase()];
        return tn;
    }

    function promote(parent, key) {
        if (parent[key].length === 0) return parent[key] = {};
        var t = {};
        for (var i in parent[key]) t[i] = parent[key][i];
        parent[key] = t;
        return t;
    }

    function parse(parts, parent, key, val) {
        var part = parts.shift();
        if (!part) {
            if (isArray(parent[key])) {
                parent[key].push(val);
            } else if ('object' == typeof parent[key]) {
                parent[key] = val;
            } else if ('undefined' == typeof parent[key]) {
                parent[key] = val;
            } else {
                parent[key] = [parent[key], val];
            }
        } else {
            var obj = parent[key] = parent[key] || [];
            if (']' == part) {
                if (isArray(obj)) {
                    if ('' !== val) obj.push(val);
                } else if ('object' == typeof obj) {
                    obj[keys(obj).length] = val;
                } else {
                    obj = parent[key] = [parent[key], val];
                }
            } else if (~part.indexOf(']')) {
                part = part.substr(0, part.length - 1);
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
                // key
            } else {
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
            }
        }
    }

    function merge(parent, key, val) {
        if (~key.indexOf(']')) {
            var parts = key.split('[');
            parse(parts, parent, 'base', val);
        } else {
            if (!isint.test(key) && isArray(parent.base)) {
                var t = {};
                for (var k in parent.base) t[k] = parent.base[k];
                parent.base = t;
            }
            if (key !== '') {
                set(parent.base, key, val);
            }
        }
        return parent;
    }

    function parseString(str) {
        return reduce(String(str).split(/&|;/), function(ret, pair) {
            try {
                pair = decodeURIComponent(pair.replace(/\+/g, ' '));
            } catch(e) {
                // ignore
            }
            var eql = pair.indexOf('='),
                brace = lastBraceInKey(pair),
                key = pair.substr(0, brace || eql),
                val = pair.substr(brace || eql, pair.length);

            val = val.substr(val.indexOf('=') + 1, val.length);

            if (key === '') {
                key = pair;
                val = '';
            }

            return merge(ret, key, val);
        }, { base: {} }).base;
    }

    function set(obj, key, val) {
        var v = obj[key];
        if (typeof v === 'undefined') {
            obj[key] = val;
        } else if (isArray(v)) {
            v.push(val);
        } else {
            obj[key] = [v, val];
        }
    }

    function lastBraceInKey(str) {
        var len = str.length,
            brace,
            c;
        for (var i = 0; i < len; ++i) {
            c = str[i];
            if (']' == c) brace = false;
            if ('[' == c) brace = true;
            if ('=' == c && !brace) return i;
        }
    }

    function reduce(obj, accumulator){
        var i = 0,
            l = obj.length >> 0,
            curr = arguments[2];
        while (i < l) {
            if (i in obj) curr = accumulator.call(undefined, curr, obj[i], i, obj);
            ++i;
        }
        return curr;
    }

    function isArray(vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    }

    function keys(obj) {
        var key_array = [];
        for ( var prop in obj ) {
            if ( obj.hasOwnProperty(prop) ) key_array.push(prop);
        }
        return key_array;
    }

    function purl( url, strictMode ) {
        if ( arguments.length === 1 && url === true ) {
            strictMode = true;
            url = undefined;
        }
        strictMode = strictMode || false;
        url = url || window.location.toString();

        return {

            data : parseUri(url, strictMode),

            // get various attributes from the URI
            attr : function( attr ) {
                attr = aliases[attr] || attr;
                return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
            },

            // return query string parameters
            param : function( param ) {
                return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query;
            },

            // return fragment parameters
            fparam : function( param ) {
                return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment;
            },

            // return path segments
            segment : function( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.path;
                } else {
                    seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.path[seg];
                }
            },

            // return fragment segments
            fsegment : function( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.fragment;
                } else {
                    seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.fragment[seg];
                }
            }

        };

    }
    
    purl.jQuery = function($){
        if ($ != null) {
            $.fn.url = function( strictMode ) {
                var url = '';
                if ( this.length ) {
                    url = $(this).attr( getAttrName(this[0]) ) || '';
                }
                return purl( url, strictMode );
            };

            $.url = purl;
        }
    };

    purl.jQuery(window.jQuery);

    return purl;

});
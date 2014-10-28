/*
Copyright (c) 2014 Thomas Churchman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
* Class that provides functionality to convert data into a password.
* @params {string} firstName First name data.
* @params {string} birthPlace Birthplace data.
* @params {string} domain Domain data.
* @params {string} accountName Account name data.
* @params {string} counter Counter data.
* @params {string} masterPassword Master password.
*/
function DataToPassword(firstName, birthPlace, domain, accountName, counter, masterPassword)
{
	var byteToChar = new ByteToChar();
	
	var salt = firstName.toLowerCase()
		+ birthPlace.toLowerCase()
		+ domain.toLowerCase()
		+ accountName.toLowerCase()
		+ counter;
	
	// Digest and convert the data to an array of byte values
	var md = forge.md.sha512.create();
	md.update(salt + masterPassword);
	var hash = md.digest().toHex();
	
	// Iterate for a bit of extra security
	for(var i = 0; i < 100; i++)
	{
		md.start();
		md.update(salt + hash);
		hash = md.digest().toHex();
	}
	
	var bytes = forge.util.hexToBytes(hash);
	b = [];
	for (var i = 0; i < bytes.length; i++ ) 
	{
		b.push(bytes.charCodeAt(i));
	}	
	
	/**
	* Generates an array of long password styles and uses that
	* to call this.Password(-) to generate a password.
	* @returns {string} The generated password.
	*/
	this.GetLongPassword = function()
	{
		start = ['Cvcv', 'Cvvc', 'CvCv'];
		middle = ['Cvcv', 'Cvvc', 'CvCv'];
		addOn = ['#n', '#n'];
		
		total = [];
		
		for(var s in start)
		{
			for(var m1 in middle)
			{
				for(var m2 in middle)
				{
					for(var m3 in middle)
					{
						for(var a1 in addOn)
						{
							for(var a2 in addOn)
							{
								total.push(start[s] + addOn[a1] + middle[m1] + addOn[a2] + middle[m2] + middle[m3]);
								total.push(start[s] + addOn[a1] + middle[m1] + middle[m2] + addOn[a2] + middle[m3]);
								total.push(start[s] + addOn[a1] + middle[m1] + middle[m2] + middle[m3] + addOn[m3]);
								
								total.push(start[s] + middle[m1] + addOn[a1] + middle[m2] + addOn[a2] + middle[m3]);
								total.push(start[s] + middle[m1] + addOn[a1] + middle[m2] + middle[m3] + addOn[a2]);
								
								total.push(start[s] + middle[m1] + middle[m2] + addOn[a1] + middle[m3] + addOn[a2]);
							}
						}
					}
				}
			}
		}
		
		return this.Password(total);
	};
		
	/**
	* Generates an array of medium password styles and uses that
	* to call this.Password(-) to generate a password.
	* @returns {string} The generated password.
	*/
	this.GetMediumPassword = function()
	{
		start = ['Cvcv', 'Cvvc', 'CvCv'];
		middle = ['Cvcv', 'Cvvc', 'CvCv'];
		addOn = ['#n', 'n#'];
		
		total = [];
		
		for(var s in start)
		{
			for(var m1 in middle)
			{
				for(var m2 in middle)
				{
					for(var a1 in addOn)
					{
						total.push(start[s] + addOn[a1] + middle[m1] + middle[m2]);
						
						total.push(start[s] + middle[m1] + addOn[a1] + middle[m2]);
						
						total.push(start[s] + middle[m1] + middle[m2] + addOn[a1]);
					}
				}
			}
		}
		
		return this.Password(total);
	};
	
	/**
	* Creates a password from one of the password styles given.
	* @param {array} passwords The password styles to choose from.
	* @returns {string} The generated password.
	*/
	this.Password = function(passwords)
	{
		p = b[0] % passwords.length;
		
		password = "";
		
		i = 1;
		for(var key in passwords[p])
		{
			var cType = passwords[p][key];
			password += byteToChar.GetChar(cType, b[i]);
			//console.log(cType);
			//console.log(b[i]);
			//console.log("-----");
			i++;
		}
		
		return password;
	}
}

/**
* Class to provide byte to character conversion.
*/
function ByteToChar()
{
	var c = 
		[
			'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k',
			'l', 'm', 'n', 'p', 'q', 'r', 's', 't',
			'v', 'w', 'x', 'y', 'z'
		];

	var C = [];

	var v =
		[
			'a', 'e', 'i', 'o', 'u', 'y'
		];

	var V = [];

	var symbols =
		[
			'!', '@', '#', '%', '&', '*', '(', ')',
			'-', '+', '_', '?'
		];

	var n =
		[
			'0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9'
		];

	var x = [];
		
	// Fill other arrays
	for(var key in c)
	{
		C.push(c[key].toUpperCase());
	}
	for(var key in v)
	{
		V.push(v[key].toUpperCase());
	}
	x = c.concat(C.concat(v.concat(V.concat(symbols.concat(n.concat(x))))));
	
	/**
	* Convert one byte (as integer) to a character.
	* @param {char} type The type of character to convert the byte to.
	* @param {number} b The byte (as integer) to convert.
	* @returns {char} The converted character.
	*/
	this.GetChar = function(type, b)
	{
		switch(type)
		{
			case 'c':
				return c[b % c.length];
			case 'C':
				return C[b % C.length];
			case 'v':
				return v[b % v.length];
			case 'V':
				return V[b % V.length];
			case 'n':
				return n[b % n.length];
			case '#':
				return symbols[b % symbols.length];
			case 'x':
				return x[b % x.length];	
		}
	};
}
const HttpClient = {
  getOptions ( method, options ) 
  {
    let result = Object.fromEntries( 
      Object.keys( this.commonAttributes ).map( attr => {

        let item = this.commonAttributes[attr];

        if ( Object.keys(options).includes( attr ) ) {
          item = options[attr];
          delete options[attr];
        }

        return [ attr,item ];

      } )
    )

    for ( let attr of Object.keys( this[`${method}Attributes`] ) ) {
      result[attr] = this[`${method}Attributes`][attr];
    }

    if ( Object.keys( options ).length ) {
      Object.keys( options ).forEach( attr => {
        result[attr] = options[attr];
      } )
    }

    return result;
  },

  getUrl ( path ) {
    return `${this.baseURL}${path}`;
  },

  createUrlParams ( params ) {
    if (!Object.keys( params ).length) return '';
    return Object.keys( params ).map( key => {
      return `${key}=${params[key]}`;
    } ).join('&');
  },
  
  get ( path, params, options ) 
  {
    options = options||{};
    params = params||{};
    path = path||'';
    const url = `${this.getUrl(path)}?${this.createUrlParams(params)}`;
    
    return this.query( url, this.getOptions( 'get',options ) );
  },

  post ( path, params, options ) 
  {
    options = options||{};
    params = params||{};
    path = path||'';
    const url = this.getUrl(path);
    options.body = options.body||JSON.stringify(params);

    return this.query( url, this.getOptions( 'post',options ) );
  },

  query ( url, options ) 
  {
    return new Promise( (resolve,reject) => 
    {
      const httpExeption = class httpExeption extends Error {};

      try {
        fetch( url, options )
          .then( 
            res => res.json(),
            error => reject( error )
          )
          .then( 
            data => resolve(data),
            error => reject( error )
          )
          .finally( () => resolve(null) )
      } catch ( err ) {
        reject( new httpExeption( err ) )
      }
      
    })
  },

  get postAttributes () {
    return {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      body: JSON.stringify({}) // body data type must match "Content-Type" header
    }
  },

  get getAttributes () {
    return {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    }
  },

  get commonAttributes () {
    return {
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
    }
  },

  init( baseURL, defaultOptions ) {
    baseURL = baseURL||'';
    defaultOptions = defaultOptions||{};
    Object.assign( this, { baseURL, defaultOptions } );
  }
}

export { HttpClient }
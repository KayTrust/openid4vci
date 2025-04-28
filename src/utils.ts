export const readUrlParams = <T extends {} = Record<string, any>>(data: string): T => {

    let params: Record<string, string|number> = {};
    if (data.includes('?')) {
      let urlParams = data.split('?')[1].split('&');
      for (let i = 0; i < urlParams.length; i++) {
        let pair = urlParams[i].split('=');
        params[pair[0]] = pair[0] === 'state' ? pair[1] : decodeURIComponent(pair[1]);
      }
    }
    return params as T;
  };
  
  export const parseToJsonFromUrlParam = <T = Record<string, any>>(param: string): T => {
    let counter = 0
    while (param.startsWith('%') && counter < 100) {
      param = decodeURIComponent(param);
      ++counter;
    }
    return JSON.parse(param);
  }

  type JWTTime = {
    iat: number;
    exp: number;
    nbf: number;
} | {};

  export const getJwtTime = (validDays: number | undefined = undefined, start: Date = new Date()): JWTTime => {
    const iat = Math.floor(start.getTime() / 1000);

    if (!validDays) validDays = 100000;

    const validSeconds = validDays * 24 * 60 * 60;
    const exp = Math.floor(iat + validSeconds);
    const nbf = Math.floor(start.getTime() / 1000);

    return { iat, exp, nbf };
};
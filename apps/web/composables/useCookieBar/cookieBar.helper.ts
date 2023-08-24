import { CookieGroup } from 'cookie.config';

const convertToDays = (daysInString: string): number => {
  return Number.parseInt(daysInString.split(' ')[0]);
};

const getMinimumLifeSpan = (cookieJsonFromConfig: any): number => {
  // expected minimum lifetime span to be in days
  let minimum = 999_999 as number;

  cookieJsonFromConfig.forEach((group: CookieGroup) => {
    const accepted = group.cookies.filter((cookie) => cookie.accepted);
    accepted.forEach((cookie) => {
      if (minimum > convertToDays(cookie.Lifespan)) {
        minimum = convertToDays(cookie.Lifespan);
      }
    });
  });

  return 60 * 60 * 24 * minimum;
};

export const cookieBarHelper = () => {
  return {
    getMinimumLifeSpan,
  };
};

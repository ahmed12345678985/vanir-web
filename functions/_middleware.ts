interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // 301 Redirect www.vanirgroup.com -> vanirgroup.com
  if (url.hostname === "www.vanirgroup.com") {
    url.hostname = "vanirgroup.com";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
};

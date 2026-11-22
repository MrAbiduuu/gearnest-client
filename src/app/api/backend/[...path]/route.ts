import { getEquipmentApiBaseUrl } from "@/lib/equipment";
import { authFetch } from "@/lib/server";

type ProxyContext = { params: Promise<{ path: string[] }> };

const ALLOWED_PREFIXES = [
  "/admin",
  "/customer",
  "/equipments",
  "/owner",
  "/users",
] as const;

const isAllowedPath = (path: string) =>
  ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

const proxy = async (request: Request, { params }: ProxyContext) => {
  const { path: segments } = await params;

  if (
    !segments?.length ||
    segments.some(
      (segment) =>
        !segment || segment === "." || segment === ".." || segment.includes("/"),
    )
  ) {
    return Response.json(
      { success: false, message: "Unknown API path." },
      { status: 404 },
    );
  }

  const targetPath = `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;

  if (!isAllowedPath(targetPath)) {
    return Response.json(
      { success: false, message: "Unknown API path." },
      { status: 404 },
    );
  }

  const incomingUrl = new URL(request.url);
  const query = incomingUrl.searchParams.toString();
  const targetUrl = `${getEquipmentApiBaseUrl()}${targetPath}${query ? `?${query}` : ""}`;

  const forwardedHeaders = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    forwardedHeaders.set("content-type", contentType);
  }

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: forwardedHeaders,
    cache: "no-store",
  };

  if (!["GET", "HEAD"].includes(method)) {
    init.body = await request.arrayBuffer();
  }

  let backendResponse: Response;
  try {
    backendResponse = await authFetch(targetUrl, init);
  } catch {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get("content-type");
  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders,
  });
};

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
};

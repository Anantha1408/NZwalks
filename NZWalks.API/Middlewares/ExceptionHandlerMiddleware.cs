using System.Net;

namespace NZWalks.API.Middlewares
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ExceptionHandlerMiddleware> logger;

        public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
        {
            this.next = next;
            this.logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await next(httpContext);
            }
            catch (Exception ex)
            {
                var errorId = Guid.NewGuid();

                // Log the exception
                logger.LogError(ex, "Error ID: {ErrorId} - {Message}", errorId, ex.Message);

                // Return a generic error response to the client
                httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                httpContext.Response.ContentType = "application/json";

                var errorResponse = new
                {
                    Id = errorId,
                    ErrorMessage = "An error occurred while processing your request"
                };

                await httpContext.Response.WriteAsJsonAsync(errorResponse);
            }
        }
    }
}

using Mentiq.Api.Common;
using Mentiq.Api.Middleware;
using Mentiq.Application;
using Mentiq.Application.Features.Subscription;
using Mentiq.Infrastructure;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicy = "AngularDevClient";

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
builder.Services.AddControllers();

// Return 422 with a consistent ApiError payload for model-validation failures.
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value is { Errors.Count: > 0 })
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

        var payload = new ApiError
        {
            Status = StatusCodes.Status422UnprocessableEntity,
            Message = "One or more validation errors occurred.",
            TraceId = context.HttpContext.TraceIdentifier,
            Errors = errors
        };

        return new UnprocessableEntityObjectResult(payload);
    };
});

builder.Services.AddOpenApi();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Subscription/pricing configuration (plans, trial length, manual-payment
// instructions) is bound from the "Subscription" section and injected as a
// plain settings object. Prices are configuration-driven, never hardcoded.
var subscriptionSettings = new SubscriptionSettings();
builder.Configuration.GetSection(SubscriptionSettings.SectionName).Bind(subscriptionSettings);
builder.Services.AddSingleton(subscriptionSettings);

// CORS is only needed for local development when the Angular dev server is
// called directly (without the dev proxy). In production the SPA and API share
// the same origin, so no CORS configuration is applied.
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(DevCorsPolicy, policy => policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
    });
}

var app = builder.Build();

// ---------------------------------------------------------------------------
// HTTP pipeline
// ---------------------------------------------------------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors(DevCorsPolicy);
}

app.UseHttpsRedirection();

// Serve the Angular production build from wwwroot (index.html + static assets).
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Any unmatched /api/* route returns a 404 (never the SPA shell).
app.Map("/api/{**path}", () => Results.NotFound(new ApiError
{
    Status = StatusCodes.Status404NotFound,
    Message = "The requested API endpoint was not found."
}));

// Client-side routing: every non-API, non-file request returns index.html.
app.MapFallbackToFile("index.html");

app.Run();

// Exposed so the integration-test WebApplicationFactory can reference the entry point.
public partial class Program;

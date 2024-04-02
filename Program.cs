var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                      });
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/prompt/{id}", (string id) =>
{
    var prompt = new Prompt(id, "An indie mashup of the bike racing and educational game genres, where you play as an invisible farmer attempting to save the world from a famous president.");
    return prompt;
})
.WithName("GetPrompt")
.WithOpenApi();

app.MapGet("/result/{id}", (string id) =>
{
    var result = new Result(id, "An indie mashup of the bike racing and educational game genres, where you play as an invisible farmer attempting to save the world from a famous president.", [59.99, 40, 0, 43.80]);
    return result;
})
.WithName("GetResult")
.WithOpenApi();

app.MapPost("/postPrice", (DataPoint price) =>
{
    var result = price;
    return result;
})
.WithName("PostPrice")
.WithOpenApi();

app.UseCors(MyAllowSpecificOrigins);

app.Run();


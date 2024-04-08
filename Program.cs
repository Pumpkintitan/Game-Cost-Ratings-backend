using Npgsql;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var connectionString = ""; // Not for GitHub
await using var dataSource = NpgsqlDataSource.Create(connectionString);

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

app.MapGet("/prompt/{id}", async (string id) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var cmd = new NpgsqlCommand("SELECT gameprompt FROM game WHERE id = $1", connection)
    {
        Parameters =
    {
            new() { Value = Int32.Parse(id) }
    }
    };
    await using var reader = await cmd.ExecuteReaderAsync();
    {
        while (await reader.ReadAsync())
        {
            var prompt = new Prompt(id, reader.GetString(0));
            return prompt;
        }

    }


    return new Prompt("0", "error");
})
.WithName("GetPrompt")
.WithOpenApi();

app.MapGet("/result/{id}", async (string id) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var cmd = new NpgsqlCommand("SELECT gamerating, gameprompt from rating JOIN game ON gameid = game.id WHERE gameid = $1;", connection)
    {
        Parameters =
    {
            new() { Value = Int32.Parse(id) }
    }
    };
    await using var reader = await cmd.ExecuteReaderAsync();
    {

        var indexOfColumn1 = reader.GetOrdinal("gamerating");
        List<double> dataList = new List<double>();
        string title = "";
        while (await reader.ReadAsync())
        {
            dataList.Add(reader.GetDouble(indexOfColumn1));
            title = reader.GetString(1);
        }
        var result = new Result(id, title, dataList);
        //new Result(id, reader.GetString(0));
        return result;

    }
})
.WithName("GetResult")
.WithOpenApi();

app.MapPost("/postPrice", async (DataPoint price) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var cmd = new NpgsqlCommand("INSERT INTO rating (gamerating, gameid) VALUES ($1, $2);", connection)
    {
        Parameters =
    {
            new() { Value = price.Price },
            new() { Value = Int32.Parse(price.Id) }
    }
    };
    await cmd.ExecuteNonQueryAsync();
    return price;
})
.WithName("PostPrice")
.WithOpenApi();

app.UseCors(MyAllowSpecificOrigins);

app.Run();


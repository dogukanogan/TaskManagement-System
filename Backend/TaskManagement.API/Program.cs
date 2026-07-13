using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Context Configuration
var databaseProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (databaseProvider.Equals("Oracle", StringComparison.OrdinalIgnoreCase))
    {
        options.UseOracle(builder.Configuration.GetConnectionString("OracleConnection"));
    }
    else
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

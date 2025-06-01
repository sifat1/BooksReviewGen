using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Bogus;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System;

namespace BooksReviewGen.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly ILogger<BooksController> _logger;
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 10;

    public BooksController(ILogger<BooksController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetBooks([FromQuery] string region = "en",[FromQuery] int seed = 42,
        [FromQuery] int page = 0,[FromQuery] double likes = 0,[FromQuery] int reviews = 0)
    {
        try
        {
            if (!IsValidLocale(region))
            {
                _logger.LogWarning("Invalid locale requested: {Locale}", region);
                return BadRequest($"Invalid locale. Supported locales are: en, fr, de, es, it");
            }

            var pageSize = page == 0 ? 20 : DefaultPageSize;
            var rngSeed = seed + page;
            Randomizer.Seed = new Random(rngSeed);

            var culture = new CultureInfo(region);
            var faker = new Faker(region);

            var bookFaker = new Faker<BookDto>(region)
                .RuleFor(b => b.Index, f => page * pageSize + f.IndexGlobal)
                .RuleFor(b => b.Isbn, f => f.Commerce.Ean13())
                .RuleFor(b => b.Title, f => GenerateBookTitle(f, region))
                .RuleFor(b => b.Authors, f => new[] { f.Name.FullName() })
                .RuleFor(b => b.Publisher, f => f.Company.CompanyName())
                .RuleFor(b => b.Likes, f => GenerateCount(likes))
                .RuleFor(b => b.ReviewCount, (int)reviews)
                .RuleFor(b => b.PublishedDate, f => f.Date.Past(10));

            var books = bookFaker.Generate(pageSize);

            _logger.LogInformation("Generated {Count} books for page {Page}", books.Count, page);
            return Ok(books);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating books");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while generating books");
        }
    }

    [HttpGet("{isbn}/reviews")]
    public IActionResult GetReviews(string isbn,[FromQuery] string region = "en",[FromQuery] int reviewsCount = 3)
    {
        try
        {
            if (!IsValidLocale(region))
            {
                return BadRequest($"Invalid locale. Supported locales are: en, fr, de, es, it");
            }

            var seed = isbn.GetHashCode();
            Randomizer.Seed = new Random(seed);

            var faker = new Faker(region);

            var reviewFaker = new Faker<ReviewDto>(region)
                .RuleFor(r => r.User, f => f.Name.FullName())
                .RuleFor(r => r.Text, f => GenerateReviewText(f, region));

            var reviews_res = reviewFaker.Generate((int)reviewsCount);

            _logger.LogInformation("Generated {Count} reviews for ISBN {Isbn}", reviews_res.Count, isbn);
            return Ok(reviews_res);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating reviews for ISBN {Isbn}", isbn);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while generating reviews");
        }
    }

    private static string GenerateBookTitle(Faker faker, string locale)
    {
        return faker.Commerce.ProductName();
    }

    private static string GenerateReviewText(Faker faker, string locale)
    {
        var templates = locale switch
        {
            "fr" => new[]
            {
                $"J'adore ce livre! {faker.Lorem.Sentence()}",
                $"Excellent livre. Je le recommande! {faker.Lorem.Sentence()}",
                $"Pas mal, mais pourrait être amélioré. {faker.Lorem.Sentence()}"
            },
            "de" => new[]
            {
                $"Ich liebe dieses Buch! {faker.Lorem.Sentence()}",
                $"Hervorragendes Buch. Sehr empfehlenswert! {faker.Lorem.Sentence()}",
                $"Nicht schlecht, könnte aber verbessert werden. {faker.Lorem.Sentence()}"
            },
            _ => new[]
            {
                $"I absolutely love this book! {faker.Lorem.Sentence()}",
                $"Excellent book. Highly recommended! {faker.Lorem.Sentence()}",
                $"It's decent but could be improved. {faker.Lorem.Sentence()}"
            }
        };

        return faker.PickRandom(templates);
    }

    private static bool IsValidLocale(string locale)
    {
        return new[] { "en", "fr", "de", "es", "it" }.Contains(locale);
    }

    private static int GenerateCount(double avg)
    {
        var baseInt = (int)avg;
        var fractional = avg - baseInt;
        return baseInt + (Random.Shared.NextDouble() < fractional ? 1 : 0);
    }
}


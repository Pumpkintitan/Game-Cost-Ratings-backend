public class Result
{
  public string Id { get; set; }
  public string? PromptText { get; set; }
  public double[]? Prices { get; set; }
  public Result(string id, string Text, double[] Data)
  {
    Id = id;
    PromptText = Text;
    Prices = Data;
  }
}
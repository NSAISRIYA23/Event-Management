using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class Program
{
    public static void Main()
    {
        var outputPath = @"C:\Event Management\backend\EventSphere.Api\uploads\sample.jpg";

        using var bmp = new Bitmap(1200, 675);
        using var g = Graphics.FromImage(bmp);

        g.SmoothingMode = SmoothingMode.HighQuality;

        var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
        using var brush = new LinearGradientBrush(
            rect,
            Color.FromArgb(15, 23, 42),
            Color.FromArgb(124, 58, 237),
            45f);

        g.FillRectangle(brush, rect);

        using (var white = new SolidBrush(Color.FromArgb(255, 255, 255)))
        using (var font1 = new Font("Arial", 84, FontStyle.Bold, GraphicsUnit.Pixel))
        {
            g.DrawString("EventSphere", font1, white, 70, 220);
        }

        using (var white = new SolidBrush(Color.FromArgb(255, 255, 255)))
        using (var font2 = new Font("Arial", 34, FontStyle.Regular, GraphicsUnit.Pixel))
        {
            g.DrawString("Sample product image", font2, white, 150, 340);
        }

        bmp.Save(outputPath, ImageFormat.Jpeg);
        Console.WriteLine($"Generated: {outputPath}");
    }
}


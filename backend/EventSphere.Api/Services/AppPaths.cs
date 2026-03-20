namespace EventSphere.Api.Services;

public sealed class AppPaths
{
    public string ContentRoot { get; }
    public string DataRoot { get; }
    public string UploadsRoot { get; }

    public AppPaths(IWebHostEnvironment env)
    {
        ContentRoot = env.ContentRootPath;
        DataRoot = Path.Combine(ContentRoot, "data");
        UploadsRoot = Path.Combine(ContentRoot, "uploads");
    }

    public void EnsureFoldersExist()
    {
        Directory.CreateDirectory(DataRoot);
        Directory.CreateDirectory(UploadsRoot);
    }
}


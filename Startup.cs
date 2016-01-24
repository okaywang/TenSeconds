using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(TenSecondsMvc.Startup))]
namespace TenSecondsMvc
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}

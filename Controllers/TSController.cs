using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using TenSecondsMvc;

namespace TenSecondsMvc.Controllers
{
    //http://qt.gtimg.cn/2579_71&q=sh600173,sz002634,sz000002
    public class TSController : Controller
    {
        // GET: Stock
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult List()
        {
            return View();
        }

        public JsonResult MinuteData(string code, int? count)
        {
            var result = new MinuteSummary();
            result.Code = code;

            var prefix = code.StartsWith("60") ? "sh" : "sz";
            if (code == "999999")
            {
                prefix = "sh";
                code = "000001";
            }
            var url = "http://data.gtimg.cn/flashdata/hushen/minute/" + prefix + code + ".js?" + new Random().NextDouble().ToString();
            var data = HttpGet(url);
            var rr = data.Split(new string[] { @"\n" }, StringSplitOptions.RemoveEmptyEntries);
            result.Code = code;
            result.Details = new List<MinuteDetail>();
            for (int i = 2; i < rr.Length - 1; i++)
            {
                var items = rr[i].Split(' ');

                result.Details.Add(new MinuteDetail
                {
                    Price = float.Parse(items[1]),
                    VolumeValue = int.Parse(items[2])
                });
            }

            if (count.HasValue)
            {
                result.Details = result.Details.Take(count.Value).ToList();
            }

            result.AverageVolumeValue = (int)(result.Details.Last().VolumeValue / result.Details.Count);

            for (int i = result.Details.Count - 1; i > 0; i--)
            {
                result.Details[i].VolumeValue = result.Details[i].VolumeValue - result.Details[i - 1].VolumeValue;
            }
            var volumeValues = result.Details.Select(i => i.VolumeValue).Distinct().OrderByDescending(i => i).ToList();
            foreach (var item in result.Details)
            {
                item.VolumeIndex = volumeValues.IndexOf(item.VolumeValue);
            }

            result.MaxVolumeValue = volumeValues.FirstOrDefault();

            if (result.Details.Any())
            {
                result.Close = result.Open = result.Details.First().Price;
                var prices = result.Details.Select(i => i.Price).Distinct().OrderBy(i => i).ToList();
                result.High = prices.Last();
                result.Low = prices.First();
            }


            return Json(result, JsonRequestBehavior.AllowGet);
        }
        public string HttpGet(string url)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";
            request.ContentType = "text/html;charset=UTF-8";

            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream myResponseStream = response.GetResponseStream();
            StreamReader myStreamReader = new StreamReader(myResponseStream, Encoding.UTF8);
            string retString = myStreamReader.ReadToEnd();
            myStreamReader.Close();
            myResponseStream.Close();

            return retString;
        }
    }

    public class MinuteSummary
    {
        public string Code { get; set; }

        public float Open { get; set; }

        public float High { get; set; }

        public float Low { get; set; }

        public float Close { get; set; }

        public int AverageVolumeValue { get; set; }

        public float Amplitude
        {
            get
            {
                var abosluteAmplitude = Math.Max((this.High - this.Close), (this.Close - this.Low));
                var relativeAmplitude = abosluteAmplitude / this.Close;
                return relativeAmplitude;
            }
        }

        public int MaxVolumeValue { get; set; }

        public List<MinuteDetail> Details { get; set; }
    }

    public class MinuteDetail
    {
        public float Price { get; set; }

        public int VolumeValue { get; set; }

        public int VolumeIndex { get; set; }
    }

    public class COHL
    {
        public float Close { get; set; }

        public float Open { get; set; }

        public float High { get; set; }

        public float Low { get; set; }
    }
}
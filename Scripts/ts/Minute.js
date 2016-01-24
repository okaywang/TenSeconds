
var _pathColor = ["000055", "#333333"];

function draw(code, count) {
    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/ts/MinuteData?code=" + code + "&count=" + count,
        success: function (response) {
            var summary = response;
            //var count = Math.min(_pointCount, prices.length);
            //drawCore(response.Code, prices.slice(0, count));
            drawCore(summary);
        }
    });
}

function drawCore(summary) {

    drawGrid();
    drawCoordinate(summary.Close, summary.Open, summary.High, summary.Low);

    drawDetail(summary);
    //var sharps = getSharpts(points);
    //markSharps(sharps);
    if (summary.Code != "399001") {
        var hammers = getHammers(summary);
        markPoints(hammers);
    }
}
function drawGrid() {
    var intevalHeightCount = 8;
    var intevalHeight = canvas.height / intevalHeightCount;
    ctx.lineWidth = 1;
    for (var i = 0; i <= intevalHeightCount; i++) {
        if (i == intevalHeightCount / 2) {
            ctx.strokeStyle = "#9999FF";
        }
        else {
            ctx.strokeStyle = "#dddddd";
        }
        var y = i * intevalHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }

    var intervalWidthCount = 4;
    var intervalWidth = canvas.width / intervalWidthCount;
    ctx.strokeStyle = "#dddddd";
    for (var j = 0; j <= intervalWidthCount; j++) {
        var x = j * intervalWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }
}
function drawCoordinate(close, open, high, low) {
    var intevalHeightCount = 8;

    var amplitude = Math.max((high - close), (close - low)) / close;

    var max = close * (1 + amplitude);

    var intevalHeight = canvas.height / intevalHeightCount;
    for (var i = 0; i <= intevalHeightCount; i++) {
        //var value = max - close * (1 - (1 / intevalHeightCount));
        var value = amplitude * (1 - 2 * i * (1 / intevalHeightCount));
        $("table.price td:eq(" + i + ")").text((value * 100).toFixed(2));
    }
}


function getSharpts(points) {
    var sharps = [];
    for (var i = 0; i < points.length - 2; i++) {
        var a = points[i + 1].y - points[i].y;
        var b = points[i + 1].y - points[i + 2].y;
        if (a > 0 && b > 0 && b >= a) {
            sharps.push(points[i + 1]);
        }
    }
    return sharps;
}
function getHammers(summary) {
    if (summary.Details[summary.Details.length - 1].Price <= summary.Details[0].Price) {
        return 100;
    }
    var hammers = [];

    var range = summary.High - summary.Low;
    if (range == 0) {
        return;
    }
    for (var i = 1; i < summary.Details.length; i++) {
        var delta = summary.Details[i].Price - summary.Details[i - 1].Price;
        if (delta >= 0) {
            continue;
        }

        if (Math.abs(delta) / range > 0.1) {
            hammers.push(summary.Details[i - 1].Point);
        }
    }
    return hammers;
}

function drawDetail(summary) {

    ctx.strokeStyle = _pathColor.shift();
    ctx.beginPath();

    for (var i = 0; i < summary.Details.length; i++) {
        var detail = summary.Details[i];
        detail.Point = {};
        detail.Point.X = i * (canvas.width / 242);
        detail.Point.Y = canvas.height / 2 + ((detail.Price - summary.Close) / summary.Close) * (1 / summary.Amplitude) * (canvas.height / 2);

        ctx.lineTo(detail.Point.X, detail.Point.Y);
        ctx.arc(detail.Point.X, detail.Point.Y, 0.5, 0, Math.PI * 2, true);

        var priviousValue = i == 0 ? summary.Close : summary.Details[i - 1].Price;

        var dom = $("table.volume td:eq(" + i + ") div");
        dom.attr("class", detail.Price > priviousValue ? "increase" : (detail.Price == priviousValue ? "keep" : "decrease"));
        var cssValue = (detail.VolumeValue / summary.MaxVolumeValue) * 100 + "%";
        dom.css("height", cssValue);
        dom.css("border-width", detail.VolumeValue > summary.AverageVolumeValue * 3 ? "2px" : "1px")
    }

    var avgHeight = (summary.AverageVolumeValue / summary.MaxVolumeValue) * 100;
    var domAvg = $(".avg-volume");
    domAvg.css({ height: avgHeight, marginTop: avgHeight * -1 });
    for (var i = 241; i >= summary.Details.length; i--) {
        var dom = $("table.volume td:eq(" + i + ") div");

        dom.attr("class", "keep");
        dom.css("height", "0%");
    }
    ctx.stroke();
}
function drawPath(points) {
    ctx.strokeStyle = _pathColor.shift();//"#333333";
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        ctx.lineTo(pt.x, pt.y);
        ctx.arc(pt.x, pt.y, 0.5, 0, Math.PI * 2, true);
    }
    ctx.stroke();
}

function markPoints(points) {
    ctx.fillStyle = "red";
    for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        ctx.fillRect(pt.X - 2, pt.Y - 2, 4, 4);
    }
}

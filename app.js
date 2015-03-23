var express = require('express')
var cheerio = require('cheerio')
var superagent = require('superagent')
var eventproxy = require('eventproxy')
var url = require('url')
var port =  18080
var path = require('path')
var _ = require('underscore')
var Movie = require('./views/models/movie');
var mongoose = require('./public/js/getConnect')
var bodyParser = require('body-parser')
var app = express()

mongoose.getConnect(); 



app.set('views','./views/pages')
app.set('view engine','jade')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname,'public')))
app.locals.moment = require('moment')
app.listen(port)

console.log('dida start on port :' + port );

app.get('/',function(req,res)
{
	// res.render('index',
	// 	{
	// 	title:'dida 首页'
	// 	})
	Movie.fetch(function(err,movies){
		if (err) {
			console.log(err)
		};
		res.render('index',
		{
		title:'dida 首页',
		movies:movies
		})
	})
})

app.get('/movie/:id',function(req,res){
	var id = req.params.id
	Movie.findById(id,function(err,movie){
		res.render('detail',{
			title: movie.title,
			movie:movie
		})
	})
})

app.get('/admin/movie',function(res,res){
	res.render('admin',{
		title:'后台录入页',
		movie:{
			title:'',
			doctor:'',
			country:'',
			year:'',
			poster:'',
			flash:'',
			summary:'',
			language:''
		}
	})
})

app.get('/admin/update/:id',function(req,res){
	var id = req.params.id

	if(id){
		Movie.findById(id,function(err,movie){
			res.render('admin',{
				title:'dida 后台更新页',
				movie:movie
			})
		})
	}
})

app.post('/admin/movie/new',function(req,res){

	var id
	var movieObj = req.body
	var _movie

	if (id === '0') 
	{
		Movie.findById(id,function(err,movie){
			if (err) {
				console.log(err)
			};
			_movie = _.extend(movie,movieObj)
			_movie.save(function(err,movie){
				if (err) {
					console.log(err)
				};
				res.redirect('/movie/' + movie._id)
			})
		})
	}
	else{
		_movie = new Movie({
			doctor:movieObj.doctor,
			title:movieObj.title,
			country:movieObj.country,
			language:movieObj.language,
			year:movieObj.year,
			summary:movieObj.summary,
			flash:movieObj.flash,
			poster:movieObj.poster
		})
		_movie.save(function(err,movie){
			if (err) {
				console.log(err)
			};
			res.redirect('/movie/' + movie._id)
		})
	}
})

app.get('/admin/list',function(req,res){
	Movie.fetch(function(err,movies){
		if (err) {
			console.log(err)
		};
		res.render('list',{
		title:'列表页',
		movies:movies
	})
	})
	
})

app.delete('/admin/list',function(req,res){	
	var id = req.query.id
	if (id){
		Movie.remove({_id:id},function(err,movie){
			if (err) {
				console.log(err)
			}else{
				res.json({success:1})
			}
		})
	}
})

//爬虫
var getUrl='http://www.bilibili.com/list/rank-kichiku.html#hot,1,2015-03-15,2015-03-22'
var masterUrl='http://www.bilibili.com/'
var items = []
app.get('/api/get',function(req,res,next){
	superagent.get(getUrl)
	.end(function(err,sres){
		if (err) {
			return next(err)
		};
		var $ = cheerio.load(sres.text);
		items = []
		
		$('.rlist a').each(function(idx,element)
		{
			var $element = $(element);

      		var href =  url.resolve(masterUrl,$element.attr('href'))
      		items.push(href);
		})
		// res.send(items)

		var ep = new eventproxy()
		ep.after('bili',items.length,function(bilis){
			res.send("success");

		})

		items.forEach(function(item){
			superagent.get(item).end(function(err,it){
				if (err) {
					console.log(err)
				};
				var $ = cheerio.load(it.text);
				var h_id = item.replace(/[^0-9]/ig,""); 
				var h_title = $('[name = title]').attr('content')
				var h_summary = $('[name = description]').attr('content')
				var h_author = $('.name').attr('card')
				var h_src = $('.cover_image').attr('src')
				var h_player = 'http://static.hdslb.com/play.swf?aid=' + h_id
				// var h_player = $('object#player_placeholder.player').attr('data') + '?' + $('[name = flashvars]').attr('value')
				// res.send(it.text)
				var _movie = new Movie({
					doctor:h_author,
					title:h_title,
					country:'中国',
					language:'中文',
					year:2015,
					summary:h_summary,
					flash:h_player,
					poster:h_src
				})

				Movie.find({flash : h_player},function(err,fdata){
					if (fdata.length === 0) {
						_movie.save(function(err,movie){
							if (err) {console.log(err)};
						})
					};
				})
			})

			ep.emit('bili',item)
		})

	})
})
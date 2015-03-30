module.exprots = function(grunt) {
	
grunt.initConfig({
	watch:{
		jade:{
			files:['views/**'],
			options:{
				livereload:true
			}
		},
		js:{
			files:['public/js/**','models/**/*.js'],
			tasks:['jshint'],
			options:{
				livereload:true
			}
		}
	},

	modemon:{
		dev:{
			options:{
				file:'app.js',
				args:[],
				ignoredFiles:['README.md','node_modules/**','.DS_Store'],
				watchedExtensions:['js'],
				watchedFolders:['app','config'],
				debug:true,
				delayTime:1,
				env:{
					PORT:18080
				},
				cwd:__dirname
			}
		}
	},

	concurrent:{
		tasks:['nodemon','watch'],
		options:{
			logConcurrentOutput:true
		}
	},
})

	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-nodemon')
	grunt.loadNpmTasks('grunt-concurrent')

	grunt.option('force',true)
	grunt.registerTask('default',['concurrent'])
}
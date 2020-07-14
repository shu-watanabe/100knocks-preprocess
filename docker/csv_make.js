/** Just a html parser.
 * public domain for this code.
 */

const { JSDOM } = require('jsdom');
const jquery=require('jquery');
const fs=require('fs');

const questionLister=function(langName,category){
    fs.readFile('doc/preprocess_knock_'+langName+'.html','utf-8',(err,data)=>{
		if(err){
			console.error(err);
			return;
		}
		const dom= new JSDOM(data);
		const $=jquery(dom.window);

		let lines=[
			'"No","大分類","小分類","設問主旨","難易度","設問内容"'
		];
		$('blockquote').each((i,e)=>{
			let p=$(e).find('p').text();
			let splited=p.match(/^[A-Z]+-(\d+)[:：] (.+)$/m);
			let out=[];
			if(!splited){
				console.log(p);
				return;
			}
			let n=category[parseInt(splited[1])-1];
			out[0]='link:ans_preprocess_knock_'+((langName=='R')?'Rmd':langName)+'.html#'+
			langName.substr(0,1).toLowerCase()+'-'+splited[1]+
			'['+langName.substr(0,1)+'-'+splited[1]+',window=ANS100]';
			out[1]=n[1];
			out[2]=n[2];
			out[3]=n[3];
			out[4]=n[4];
			out[5]=splited[2];

			splited=$(e).find('ul');
			if(splited.length){
				out[5]+='\n\n';
				splited.find('li').each((i,e)=>{
					out[5]+='* '+$(e).text()+'\n';
				});
			}

			let $next=$(e).next();
			if($next.length && $next.find('code')){
				out[5]+='\n\n[source,'+langName+']\n....\n';
				out[5]+=$next.find('code').text();
				out[5]+='\n....';
			}

			lines.push(
				'"' + out[0] +
				'","' + out[1] +
				'","' + out[2] +
				'","' + out[3] +
				'","' + out[4] +
				'","' + out[5].replace(/"/gi,'""') + '"'
			);
		});
		fs.writeFile('doc/questions_'+langName+'.csv',lines.join('\n'),{encoding:'utf-8'},(err)=>{
			if(err){
				console.error(err);
				return;
			}
		});
	});
};

fs.readFile('doc/category.json',(err,data)=>{
	let category=JSON.parse(data);

	questionLister('Python',category);
	questionLister('R',category);
	questionLister('SQL',category);
});
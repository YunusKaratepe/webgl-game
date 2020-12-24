"use strict";

var canvas;
var gl;

const canvasSizeX= 1024;
const canvasSizeY= 1024;

var NumVertices  = 36;

var points = [];
var colors = [];

var cubes = [];

var axis = 0;
var theta = [ 0, 5, 4 ];

var thetaLoc;
var thetaLoc2;
var program; 
var cBuffer;
var cBuffer2;
var vBuffer;
var vBuffer2;

var black = [ 0.0, 0.0, 0.0, 1.0 ];
var red = [ 1.0, 0.3, 0.0, 1.0 ]; // 
var yellow = [ 1.0, 0.8, 0.2, 1.0 ];  // 
var green = [ 0.0, 1.0, 0.2, 1.0 ]; // green
var blue = [ 0.2, 0.35, 0.9, 1.0 ];  // blue
var magenta = [ 0.5, 0.2, 0.9, 1.0 ];  // magenta
var cyan = [ 0.0, 0.5, 0.8, 1.0 ];  // cyan
var white = [ 1.0, 1.0, 1.0, 1.0 ]   // white
var moveX= 0.0;
var moveY= 0;
var moveZ= 0.0;
var eyeX = 0;
var eyeY = 0;


var Radian = 90;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvasSizeX, canvasSizeY );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    // 
   
    //zemin
    var col1= [ 0.8, 0.3, 0.5, 1.0 ]
    colorCube(0, 2, 0,
        100,1,100,col1);  
    //duvar karşı
    var col2= [ 0.3, 0.4, 0.4, 0.1]
    colorCube(-7, 1,0,
        14,5,1,col2); 
    
    //duvar2 
    colorCube(-7, 1,0
        ,1,5,5,col2); 
    
    //duvar3 
    colorCube(6, 1,0,
        1,5,5,col2); 

    program = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
 
  
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition ); 
    // thetaLoc2 = gl.getUniformLocation(program2, "theta");
     

    matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    matViewTersUniformLocation = gl.getUniformLocation(program, 'mViewTers');
    matMoveUniformLocation = gl.getUniformLocation(program, 'mMove');
    matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    matTransMatrixUniformLocation = gl.getUniformLocation(program, 'transMatrix');
    

    worldMatrix = new Float32Array(16);
    viewMatrix = new Float32Array(16);
    // viewMatrixTers = new Float32Array(16);
    projMatrix = new Float32Array(16);
    moveMatrix = new Float32Array(16);
    transMatrix = new Float32Array(3);
    //rotateY = new Float32Array(16);
    

    document.addEventListener('keydown', function onDownUp(event)
    {
        switch(event.key){
            case 'w':
                moveX -= viewMatrix[8]
                moveZ += viewMatrix[10]
                break;
            case 's':
                moveX += viewMatrix[8]
                moveZ -= viewMatrix[10]
                break;
            case 'd':
                moveX -= viewMatrix[0]
                moveZ += viewMatrix[2]
                break;
            case 'a':
                moveX += viewMatrix[0]
                moveZ -= viewMatrix[2]
                break;
        }  
    }, false);
    document.addEventListener('mousemove', function (event) {
        var x = event.clientX;
        var y = event.clientY;
        if (x>canvasSizeX-100)
            eyeX = 2
        else 
            if(x<100)
                eyeX = -2
            else 
                eyeX = 0
      }, false)
    
    glMatrix.mat4.lookAt(viewMatrix, 
        [0, 0, 0], // eye - Position of the viewer
        [0, 0, 0], //center - Point the viewer is looking at
        [0, 1, 0] // up - vec3 pointing up -> kameranın normal vektörü
    );
    

    render();
}
var angle = 0;
var yRotationMatrix;
var xRotationMatrix;
var identityMatrix;
var worldMatrix;
var viewMatrix;
var viewMatrixTers;
var projMatrix;
var moveMatrix;
var rotateX;
var rotateY;
var matWorldUniformLocation;
var matViewUniformLocation;
var matViewTersUniformLocation;
var matProjUniformLocation;
var matMoveUniformLocation;
var matRotateXUniformLocation;
var matRotateYUniformLocation;
var transMatrix;
var matTransMatrixUniformLocation;

/*
document.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            eyeY = 0;
            break;
        case 'ArrowDown': 
            eyeY = 0;
            break;
        case 'ArrowLeft':
            eyeX = 0;
            break;
        case 'ArrowRight':
            eyeX = 0;
            break;
    }
  });*/


function colorCube(x,y,z,w,h,r,color)
{ 
    quad( 1, 0, 3, 2,-x,y,z,w,h,r,color ); 
    quad( 2, 3, 7, 6,-x,y,z,w,h,r,color  ); 
    quad( 3, 0, 4, 7,-x,y,z,w,h,r,color  ); 
    quad( 6, 5, 1, 2,-x,y,z,w,h,r,color  );
    quad( 4, 5, 6, 7,-x,y,z,w,h,r,color  );
    quad( 5, 4, 0, 1,-x,y,z,w,h,r,color  );
}

function quad(a, b, c, d,x,y,z,w,h,r,color)
{
    var vertices = [
        vec4( -x, -y,  -z+r, 1.0 ),
        vec4( -x,  -y+h,  -z+r, 1.0 ),
        vec4(  -x+w,  -y+h,  -z+r, 1.0 ),
        vec4(  -x+w, -y,  -z+r, 1.0 ),
        vec4( -x, -y, -z, 1.0 ),
        vec4( -x,  -y+h, -z, 1.0 ), 
        vec4(  -x+w,  -y+h, -z, 1.0 ),
        vec4(  -x+w, -y, -z, 1.0 )
    ];

    var vertexColors = [
        black,
        color,
        yellow,
        green,
        color,
        yellow,
        color,
        white
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad ind0ices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        // colors.push( vertexColors[i] );
        // for solid colored faces use
        colors.push(color)
        // colors.push(vertexColors[a]); 
    }
   
}
function render()
{
    // angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    // glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, 0, [0, 1, 0]);
    // glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    // glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    glMatrix.mat4.identity(worldMatrix);
    
    glMatrix.mat4.rotate(viewMatrix, viewMatrix, glMatrix.glMatrix.toRadian(eyeX), [0, 1, 0])
    
    glMatrix.mat4.fromTranslation(moveMatrix, [moveX, 0, moveZ]);


    glMatrix.mat4.perspective(projMatrix,
        glMatrix.glMatrix.toRadian(90),
         canvas.clientWidth / canvas.clientHeight, 
         0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matMoveUniformLocation, gl.FALSE, moveMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    // glMatrix.mat4.translate(moveMatrix, moveMatrix, [moveX, moveY, moveZ]);

    
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    gl.drawArrays( gl.TRIANGLES, 0, points.length );

 
    requestAnimFrame( render );
}

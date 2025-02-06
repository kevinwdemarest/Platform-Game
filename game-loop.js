// game.js - Endless runner game engine
class Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        
        // Camera position for scrolling
        this.cameraX = 0;
        
        // Score based on distance traveled
        this.distance = 0;
        
        this.player = {
            x: this.canvas.width / 3, // Keep player at 1/3 of screen
            y: 100,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            speed: 5,
            maxSpeed: 8
        };
        
        this.gravity = 0.5;
        this.jumpForce = -12;
        
        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false
        };
        
        // Platform generation parameters
        this.minPlatformWidth = 100;
        this.maxPlatformWidth = 300;
        this.minGapWidth = 100;
        this.maxGapWidth = 200;
        this.platformHeight = 20;
        
        // Generate initial platforms
        this.platforms = [];
        this.generateInitialPlatforms();
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Event listeners
        this.canvas.addEventListener('touchstart', this.handleTouch);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    generateInitialPlatforms() {
        // Create ground platform
        this.platforms.push({
            x: 0,
            y: this.canvas.height - 50,
            width: this.canvas.width * 2,
            height: 50
        });
        
        // Generate initial set of platforms
        let nextX = this.canvas.width;
        for (let i = 0; i < 10; i++) {
            this.addNewPlatform(nextX);
            nextX += this.platforms[this.platforms.length - 1].width + 
                    this.randomBetween(this.minGapWidth, this.maxGapWidth);
        }
    }
    
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    addNewPlatform(startX) {
        const width = this.randomBetween(this.minPlatformWidth, this.maxPlatformWidth);
        const y = this.randomBetween(
            this.canvas.height * 0.3,  // Minimum height
            this.canvas.height * 0.7   // Maximum height
        );
        
        this.platforms.push({
            x: startX,
            y: y,
            width: width,
            height: this.platformHeight
        });
    }
    
    handleKeyDown(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.input.left = true;
                break;
            case 'ArrowRight':
                this.input.right = true;
                break;
            case 'Space':
                this.input.jump = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.input.left = false;
                break;
            case 'ArrowRight':
                this.input.right = false;
                break;
            case 'Space':
                this.input.jump = false;
                break;
        }
    }
    
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.clientX;
        
        if (x < this.canvas.width / 3) {
            this.input.left = true;
            this.input.right = false;
        } else if (x > (this.canvas.width * 2) / 3) {
            this.input.right = true;
            this.input.left = false;
        } else {
            this.input.jump = true;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
    }
    
    update() {
        // Handle movement
        if (this.input.right) {
            this.player.velocityX = this.player.speed;
        } else if (this.input.left) {
            this.player.velocityX = -this.player.speed;
        } else {
            this.player.velocityX = 0;
        }
        
        // Handle jumping
        if (this.input.jump && !this.player.isJumping) {
            this.player.velocityY = this.jumpForce;
            this.player.isJumping = true;
        }
        
        // Apply gravity
        this.player.velocityY += this.gravity;
        
        // Update player position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Update camera position to follow player
        if (this.player.x > this.canvas.width / 3) {
            this.cameraX = this.player.x - this.canvas.width / 3;
            // Update distance score
            this.distance = Math.floor(this.cameraX / 100); // Score increases as you move right
        }
        
        // Check for platform removal and generation
        this.updatePlatforms();
        
        // Check collisions
        this.checkCollisions();
        
        // Check for game over (falling below screen)
        if (this.player.y > this.canvas.height) {
            this.resetGame();
        }
    }
    
    updatePlatforms() {
        // Remove platforms that are too far behind
        this.platforms = this.platforms.filter(platform => 
            platform.x + platform.width > this.cameraX - 300
        );
        
        // Add new platforms if needed
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform.x + lastPlatform.width < this.cameraX + this.canvas.width + 500) {
            this.addNewPlatform(
                lastPlatform.x + lastPlatform.width + 
                this.randomBetween(this.minGapWidth, this.maxGapWidth)
            );
        }
    }
    
    checkCollisions() {
        this.player.isJumping = true;
        
        for (let platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                if (this.player.velocityY > 0 &&
                    this.player.y + this.player.height - this.player.velocityY <= platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isJumping = false;
                }
            }
        }
    }
    
    resetGame() {
        this.cameraX = 0;
        this.distance = 0;
        this.player.x = this.canvas.width / 3;
        this.player.y = 100;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.platforms = [];
        this.generateInitialPlatforms();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.ctx.fillStyle = '#888888';
        for (let platform of this.platforms) {
            this.ctx.fillRect(
                platform.x - this.cameraX,
                platform.y,
                platform.width,
                platform.height
            );
        }
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(
            this.player.x - this.cameraX,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Distance: ${this.distance}`, 20, 40);
        
        // Draw touch control indicators on mobile
        if ('ontouchstart' in window) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width / 3, this.canvas.height);
            this.ctx.fillRect((this.canvas.width * 2) / 3, 0, this.canvas.width / 3, this.canvas.height);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
}

// Start the game
window.onload = () => {
    new Game();
};
